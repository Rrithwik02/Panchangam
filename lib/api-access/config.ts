// Every API product limit lives here, read from the environment once. These
// are product limits chosen to keep cost predictable and database load low —
// not statements about what Supabase could technically serve.

function intFromEnv(name: string, fallback: number, min = 1, max = Number.MAX_SAFE_INTEGER) {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) return fallback;
  return value;
}

export interface ApiConfig {
  /** Successful requests per billing period, per customer. */
  monthlyQuota: number;
  /** Per API key. */
  ratePerMinute: number;
  /** Per API key. */
  burstPerSecond: number;
  /** Per API key. */
  maxConcurrent: number;
  /** Hard cap on the whole request, after which the API answers 504. */
  requestTimeoutMs: number;
  /** Cap on a single Supabase query. */
  dbTimeoutMs: number;
  /** Largest span, in days, a range request may cover. */
  maxRangeDays: number;
  /** Active (unrevoked) keys a customer may hold at once. */
  maxActiveKeys: number;
  /** Server-side Panchangam cache. */
  cacheTtlSeconds: number;
  cacheMaxEntries: number;
  /** Infrastructure protection per client IP (not the customer quota). */
  ipRequestsPerMinute: number;
  ipAuthFailuresPerMinute: number;
  ipBlockSeconds: number;
  /** Public website Panchangam endpoints, per client IP. */
  webRequestsPerMinute: number;
  /** Key-sharing / proxy anomaly detection. */
  anomalyWindowMinutes: number;
  anomalyDistinctIps: number;
  anomalyDistinctCountries: number;
  anomalyTightenMinutes: number;
  sustainedRejectionsPerHour: number;
}

let cached: ApiConfig | null = null;

export function getApiConfig(): ApiConfig {
  if (cached) return cached;

  cached = {
    monthlyQuota: intFromEnv("API_MONTHLY_QUOTA", 10_000),
    ratePerMinute: intFromEnv("API_RATE_LIMIT_PER_MINUTE", 60),
    burstPerSecond: intFromEnv("API_BURST_LIMIT_PER_SECOND", 5),
    maxConcurrent: intFromEnv("API_MAX_CONCURRENT_REQUESTS", 2),
    requestTimeoutMs: intFromEnv("API_REQUEST_TIMEOUT_MS", 8_000, 500, 60_000),
    dbTimeoutMs: intFromEnv("API_DB_TIMEOUT_MS", 4_000, 200, 30_000),
    maxRangeDays: intFromEnv("API_MAX_RANGE_DAYS", 31, 1, 366),
    maxActiveKeys: intFromEnv("API_MAX_ACTIVE_KEYS", 3, 1, 20),
    cacheTtlSeconds: intFromEnv("API_CACHE_TTL_SECONDS", 6 * 60 * 60, 0),
    cacheMaxEntries: intFromEnv("API_CACHE_MAX_ENTRIES", 5_000, 10),
    ipRequestsPerMinute: intFromEnv("API_IP_LIMIT_PER_MINUTE", 600),
    ipAuthFailuresPerMinute: intFromEnv("API_IP_AUTH_FAILURES_PER_MINUTE", 30),
    ipBlockSeconds: intFromEnv("API_IP_BLOCK_SECONDS", 300),
    webRequestsPerMinute: intFromEnv("WEB_IP_LIMIT_PER_MINUTE", 120),
    anomalyWindowMinutes: intFromEnv("API_ANOMALY_WINDOW_MINUTES", 10),
    anomalyDistinctIps: intFromEnv("API_ANOMALY_DISTINCT_IPS", 20),
    anomalyDistinctCountries: intFromEnv("API_ANOMALY_DISTINCT_COUNTRIES", 4),
    anomalyTightenMinutes: intFromEnv("API_ANOMALY_TIGHTEN_MINUTES", 30),
    sustainedRejectionsPerHour: intFromEnv("API_SUSTAINED_REJECTIONS_PER_HOUR", 600),
  };

  return cached;
}

/** Test helper: re-read the environment on next access. */
export function resetApiConfigForTests() {
  cached = null;
}
