import { createHash, randomUUID } from "node:crypto";
import type { ApiConfig } from "./config";
import type { ApiEndpoint, EndpointResult } from "./endpoints";
import { apiError, API_RESPONSE_HEADERS, type ApiErrorCode } from "./errors";
import { extractBearerKey, hashApiKey } from "./keys";
import { BlockList, WindowCounter } from "./memory-limiter";
import { hasCredentialInUrl, readQuery } from "./validation";
import { clientIp } from "@/lib/http/client-ip";

// The request pipeline every paid API call goes through:
//
//   HTTPS → IP flood shield → key in URL? → Authorization header → key format
//   → query validation → per-instance key back-off → api_authorize (Postgres:
//   key, revocation, API subscription, burst, per-minute, concurrency, quota
//   reservation) → endpoint (cache → Supabase) under a timeout → api_finish
//   (release slot, refund quota if the request failed, log, anomaly check).
//
// Everything that can be rejected without the database is rejected first.

export interface AuthorizeArgs {
  p_key_hash: string;
  p_request_id: string;
  p_quota: number;
  p_per_second: number;
  p_per_minute: number;
  p_max_concurrent: number;
  p_slot_ttl_seconds: number;
  p_log: Record<string, unknown>;
}

export interface FinishArgs {
  p_request_id: string;
  p_key_id: string;
  p_user_id: string;
  p_period_start: string | null;
  p_success: boolean;
  p_log: Record<string, unknown>;
  p_anomaly: Record<string, unknown>;
}

/** Calls the Postgres functions; returns their raw jsonb result. */
export interface ApiAccessStore {
  authorize(args: AuthorizeArgs, signal: AbortSignal): Promise<unknown>;
  finish(args: FinishArgs, signal: AbortSignal): Promise<void>;
}

export interface DatabaseHealth {
  isOpen(): boolean;
  retryAfterSeconds(): number;
  success(): void;
  failure(): void;
}

export interface ApiHandlerDeps {
  config: ApiConfig;
  /** null when the server has no service-role key: the API fails closed. */
  store: ApiAccessStore | null;
  health: DatabaseHealth;
  ipHashSalt: string;
  logger: (entry: Record<string, unknown>) => void;
  isProduction: boolean;
}

type AuthorizeOk = {
  ok: true;
  key_id: string;
  user_id: string;
  key_prefix: string;
  period_start: string;
  period_end: string;
  quota: number;
  used: number;
  minute_limit: number;
  minute_remaining: number;
};

type AuthorizeRejected = {
  ok: false;
  error: "invalid_api_key" | "api_access_required" | "rate_limit_exceeded" | "concurrency_limit_exceeded" | "monthly_quota_exceeded";
  status: number;
  retry_after?: number | null;
  key_id?: string;
  user_id?: string;
};

type BlockReason = "invalid_api_key" | "api_access_required" | "rate_limit_exceeded" | "monthly_quota_exceeded";

const REJECTION_CODES = new Set<AuthorizeRejected["error"]>([
  "invalid_api_key",
  "api_access_required",
  "rate_limit_exceeded",
  "concurrency_limit_exceeded",
  "monthly_quota_exceeded",
]);

function parseAuthorize(raw: unknown): AuthorizeOk | AuthorizeRejected {
  const value = raw as { ok?: unknown; key_id?: unknown; user_id?: unknown; error?: unknown } | null;
  if (value?.ok === true && typeof value.key_id === "string" && typeof value.user_id === "string") {
    return value as AuthorizeOk;
  }
  if (value?.ok === false && REJECTION_CODES.has(value.error as AuthorizeRejected["error"])) {
    return value as AuthorizeRejected;
  }
  throw new Error("Unexpected authorize result");
}

class TimeoutError extends Error {}

function withTimeout<T>(work: (signal: AbortSignal) => Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new TimeoutError("timeout"));
    }, ms);
  });
  return Promise.race([work(controller.signal), timeout]).finally(() => clearTimeout(timer));
}

function isLocalHost(url: URL) {
  return url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "::1";
}

export function createApiHandler(deps: ApiHandlerDeps) {
  const { config } = deps;

  // Per-instance first line of defence (see memory-limiter.ts).
  const ipRequests = new WindowCounter(config.ipRequestsPerMinute, 60_000);
  const ipAuthFailures = new WindowCounter(config.ipAuthFailuresPerMinute, 60_000);
  const ipBlocks = new BlockList<"flood">();
  const keyBurst = new WindowCounter(config.burstPerSecond, 1_000);
  const keyMinute = new WindowCounter(config.ratePerMinute, 60_000);
  const keyBlocks = new BlockList<BlockReason>();

  const slotTtlSeconds = Math.ceil(config.requestTimeoutMs / 1000) + 5;
  const hashIp = (ip: string) =>
    createHash("sha256").update(`${deps.ipHashSalt}:${ip}`).digest("hex").slice(0, 32);

  return function route<P>(endpoint: ApiEndpoint<P>) {
    return async function handle(request: Request): Promise<Response> {
      const startedAt = performance.now();
      const requestId = randomUUID();
      const url = new URL(request.url);
      const ipHash = hashIp(clientIp(request.headers));
      const country = request.headers.get("x-vercel-ip-country")?.slice(0, 2) || null;
      const userAgent = request.headers.get("user-agent")?.slice(0, 256) || null;

      let keyId: string | null = null;
      let userId: string | null = null;
      let keyPrefix: string | null = null;
      let cache: EndpointResult["cache"] = "none";

      // Structured log for every request. Never the key, never the query string.
      const respond = (response: Response, error?: ApiErrorCode) => {
        response.headers.set("X-Request-Id", requestId);
        deps.logger({
          type: "api_request",
          ts: new Date().toISOString(),
          request_id: requestId,
          endpoint: endpoint.path,
          method: request.method,
          status: response.status,
          ms: Math.round(performance.now() - startedAt),
          key_id: keyId,
          key_prefix: keyPrefix,
          user_id: userId,
          ip_hash: ipHash,
          country,
          user_agent: userAgent,
          cache,
          error: error ?? null,
        });
        return response;
      };
      const reject = (status: number, code: ApiErrorCode, message?: string, headers?: Record<string, string>) =>
        respond(apiError(status, code, message, headers), code);
      const retryHeaders = (seconds: number | null | undefined) =>
        seconds ? { "Retry-After": String(seconds) } : undefined;

      // 1. Transport. Vercel already redirects HTTP to HTTPS; this guards other hosts.
      const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? url.protocol.replace(":", "");
      if (deps.isProduction && proto !== "https" && !isLocalHost(url)) {
        return reject(403, "https_required");
      }

      // 2. Infrastructure shield per IP (independent of any customer quota).
      const ipBlocked = ipBlocks.check(ipHash);
      if (ipBlocked) return reject(429, "too_many_requests", undefined, retryHeaders(ipBlocked.retryAfter));
      if (ipRequests.hit(ipHash)) {
        ipBlocks.block(ipHash, config.ipBlockSeconds, "flood");
        return reject(429, "too_many_requests", undefined, retryHeaders(config.ipBlockSeconds));
      }
      const authFailed = () => {
        if (ipAuthFailures.hit(ipHash)) ipBlocks.block(ipHash, config.ipBlockSeconds, "flood");
      };

      // 3. Credentials only in the Authorization header.
      if (hasCredentialInUrl(url)) {
        authFailed();
        return reject(400, "invalid_request", "Send your API key in the Authorization header, never in the URL.");
      }
      const bearer = extractBearerKey(request.headers);
      if (bearer.kind !== "ok") {
        authFailed();
        return reject(401, bearer.kind === "missing" ? "missing_api_key" : "invalid_api_key", undefined, {
          "WWW-Authenticate": 'Bearer realm="panchangam-api"',
        });
      }

      // 4. Validate the request before any database work.
      const query = readQuery(url, endpoint.params);
      if (!query.ok) return reject(400, "invalid_request", query.message);
      const params = endpoint.parse(query.value, config);
      if (!params.ok) return reject(400, "invalid_request", params.message);

      // 5. Per-instance back-off for keys the database recently turned away,
      //    plus a local pre-check of the burst/minute limits.
      const keyHash = hashApiKey(bearer.secret);
      const blocked = keyBlocks.check(keyHash);
      if (blocked) {
        if (blocked.reason === "invalid_api_key") authFailed();
        const status = blocked.reason === "invalid_api_key" ? 401 : blocked.reason === "api_access_required" ? 403 : 429;
        return reject(status, blocked.reason, undefined, status === 429 ? retryHeaders(blocked.retryAfter) : undefined);
      }
      const localWait = keyBurst.hit(keyHash) || keyMinute.hit(keyHash);
      if (localWait) return reject(429, "rate_limit_exceeded", undefined, retryHeaders(localWait));

      // 6. Authoritative checks in one database round trip.
      if (!deps.store) return reject(503, "service_unavailable", undefined, retryHeaders(30));
      if (deps.health.isOpen()) {
        return reject(503, "service_unavailable", undefined, retryHeaders(deps.health.retryAfterSeconds()));
      }

      const store = deps.store;
      let auth: AuthorizeOk | AuthorizeRejected;
      try {
        const raw = await withTimeout(
          (signal) =>
            store.authorize(
              {
                p_key_hash: keyHash,
                p_request_id: requestId,
                p_quota: config.monthlyQuota,
                p_per_second: config.burstPerSecond,
                p_per_minute: config.ratePerMinute,
                p_max_concurrent: config.maxConcurrent,
                p_slot_ttl_seconds: slotTtlSeconds,
                p_log: {
                  endpoint: endpoint.path,
                  ip_hash: ipHash,
                  country,
                  user_agent: userAgent,
                  sustained_rejections_per_hour: config.sustainedRejectionsPerHour,
                },
              },
              signal
            ),
          config.dbTimeoutMs
        );
        auth = parseAuthorize(raw);
        deps.health.success();
      } catch {
        deps.health.failure();
        return reject(503, "service_unavailable", undefined, retryHeaders(30));
      }

      keyId = auth.key_id ?? null;
      userId = auth.user_id ?? null;

      if (!auth.ok) {
        switch (auth.error) {
          case "invalid_api_key":
            authFailed();
            keyBlocks.block(keyHash, 60, "invalid_api_key");
            return reject(401, "invalid_api_key");
          case "api_access_required":
            keyBlocks.block(keyHash, 15, "api_access_required");
            return reject(403, "api_access_required");
          case "rate_limit_exceeded":
            keyBlocks.block(keyHash, auth.retry_after ?? 1, "rate_limit_exceeded");
            return reject(429, "rate_limit_exceeded", undefined, retryHeaders(auth.retry_after ?? 1));
          case "concurrency_limit_exceeded":
            return reject(429, "concurrency_limit_exceeded", undefined, retryHeaders(1));
          case "monthly_quota_exceeded":
            keyBlocks.block(keyHash, 60, "monthly_quota_exceeded");
            return reject(429, "monthly_quota_exceeded", undefined, retryHeaders(auth.retry_after));
        }
      }

      keyPrefix = auth.key_prefix;

      // 7. The endpoint itself (cache → Supabase), under a hard timeout.
      let result: EndpointResult;
      try {
        result = await withTimeout(() => endpoint.run(params.value), config.requestTimeoutMs);
      } catch (error) {
        const timedOut = error instanceof TimeoutError;
        result = {
          status: timedOut ? 504 : 500,
          cache: "none",
          error: timedOut ? "request_timeout" : "internal_error",
          body: null,
        };
      }
      cache = result.cache;
      const success = result.status >= 200 && result.status < 300;

      // 8. Release the concurrency slot, refund the quota unit if the request
      //    failed, and record usage. Awaited (briefly) so the slot is free
      //    before the client can send its next request.
      try {
        await withTimeout(
          (signal) =>
            store.finish(
              {
                p_request_id: requestId,
                p_key_id: auth.key_id,
                p_user_id: auth.user_id,
                p_period_start: auth.period_start,
                p_success: success,
                p_log: {
                  key_prefix: auth.key_prefix,
                  endpoint: endpoint.path,
                  status: result.status,
                  error_code: result.error ?? null,
                  response_ms: Math.round(performance.now() - startedAt),
                  cache_status: result.cache,
                  ip_hash: ipHash,
                  country,
                  user_agent: userAgent,
                },
                p_anomaly: {
                  window_minutes: config.anomalyWindowMinutes,
                  distinct_ips: config.anomalyDistinctIps,
                  distinct_countries: config.anomalyDistinctCountries,
                  tighten_minutes: config.anomalyTightenMinutes,
                },
              },
              signal
            ),
          Math.min(config.dbTimeoutMs, 2_000)
        );
      } catch {
        // The slot expires by itself after the request timeout; never fail
        // an already-served response because bookkeeping was slow.
      }

      const used = success ? auth.used : Math.max(0, auth.used - 1);
      const headers: Record<string, string> = {
        ...API_RESPONSE_HEADERS,
        "X-RateLimit-Limit": String(auth.minute_limit),
        "X-RateLimit-Remaining": String(auth.minute_remaining),
        "X-Quota-Limit": String(auth.quota),
        "X-Quota-Remaining": String(Math.max(0, auth.quota - used)),
        "X-Quota-Reset": new Date(auth.period_end).toISOString(),
      };

      if (result.error) {
        if (result.retryAfter) headers["Retry-After"] = String(result.retryAfter);
        return reject(result.status, result.error, undefined, headers);
      }
      return respond(Response.json(result.body, { status: result.status, headers }));
    };
  };
}
