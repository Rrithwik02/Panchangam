import { SUPPORTED_RANGE } from "@/lib/billing/plans";
import type { ApiConfig } from "./config";
import { DEFAULT_MESSAGES, type ApiErrorCode } from "./errors";

// Single description of the public API contract, used by /docs and the
// OpenAPI document so the two can't drift apart.

export interface EndpointDoc {
  path: string;
  summary: string;
  params: { name: string; required: boolean; description: string }[];
}

const LOCATION = [
  { name: "timezone", required: true, description: "IANA timezone, e.g. Asia/Kolkata." },
  { name: "latitude", required: false, description: "-90 to 90. Send with longitude, or omit both." },
  { name: "longitude", required: false, description: "-180 to 180. Send with latitude, or omit both." },
];

export function endpointDocs(config: ApiConfig): EndpointDoc[] {
  return [
    { path: "/panchangam/today", summary: "Today's Panchangam in the given timezone.", params: LOCATION },
    { path: "/panchangam/yesterday", summary: "Yesterday's Panchangam in the given timezone.", params: LOCATION },
    { path: "/panchangam/tomorrow", summary: "Tomorrow's full Panchangam in the given timezone.", params: LOCATION },
    {
      path: "/panchangam/date",
      summary: "Panchangam for one date.",
      params: [{ name: "date", required: true, description: "YYYY-MM-DD." }, ...LOCATION],
    },
    {
      path: "/panchangam/range",
      summary: `Panchangam for up to ${config.maxRangeDays} consecutive days.`,
      params: [
        { name: "start_date", required: true, description: "YYYY-MM-DD." },
        { name: "end_date", required: true, description: `YYYY-MM-DD, at most ${config.maxRangeDays} days after start_date (inclusive).` },
        ...LOCATION,
      ],
    },
    {
      path: "/panchangam/month",
      summary: "Panchangam for every day of one month.",
      params: [
        { name: "year", required: true, description: "Four-digit year." },
        { name: "month", required: true, description: "1–12." },
        ...LOCATION,
      ],
    },
    {
      path: "/calendar/month",
      summary: "Compact calendar (vara, paksha, tithi, nakshatra, yoga, karana) for one month.",
      params: [
        { name: "year", required: true, description: "Four-digit year." },
        { name: "month", required: true, description: "1–12." },
        ...LOCATION,
      ],
    },
    {
      path: "/festivals/month",
      summary: "Festivals for every day of one month.",
      params: [
        { name: "year", required: true, description: "Four-digit year." },
        { name: "month", required: true, description: "1–12." },
        ...LOCATION,
      ],
    },
  ];
}

export const ERROR_DOCS: { status: number; code: ApiErrorCode; when: string }[] = [
  { status: 400, code: "invalid_request", when: "Malformed or unsupported parameters, date outside the dataset, range too long, or a key in the URL." },
  { status: 401, code: "missing_api_key", when: "No Authorization header." },
  { status: 401, code: "invalid_api_key", when: "Unknown, malformed or revoked key." },
  { status: 403, code: "api_access_required", when: "The key's account has no active API subscription." },
  { status: 404, code: "not_found", when: "No data for the requested date." },
  { status: 404, code: "unsupported_endpoint", when: "The path isn't part of the API." },
  { status: 429, code: "rate_limit_exceeded", when: "Per-second burst or per-minute limit reached. See Retry-After." },
  { status: 429, code: "concurrency_limit_exceeded", when: "Too many simultaneous requests for this key." },
  { status: 429, code: "monthly_quota_exceeded", when: "This billing period's quota is used up." },
  { status: 429, code: "too_many_requests", when: "Abusive traffic from your network (e.g. many invalid keys)." },
  { status: 503, code: "service_unavailable", when: "Temporary outage. Retry after the Retry-After interval." },
  { status: 504, code: "request_timeout", when: "The request took too long. Safe to retry." },
];

export function buildOpenApi(config: ApiConfig) {
  const errorResponse = (description: string) => ({
    description,
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
  });

  const paths: Record<string, unknown> = {};
  for (const endpoint of endpointDocs(config)) {
    paths[endpoint.path] = {
      get: {
        summary: endpoint.summary,
        security: [{ bearerAuth: [] }],
        parameters: endpoint.params.map((p) => ({
          name: p.name,
          in: "query",
          required: p.required,
          description: p.description,
          schema: { type: "string" },
        })),
        responses: {
          "200": { description: "Panchangam data." },
          "400": errorResponse("Invalid request."),
          "401": errorResponse("Missing, invalid or revoked API key."),
          "403": errorResponse("Active API subscription required."),
          "404": errorResponse("No data for the requested date."),
          "429": errorResponse("Rate, concurrency or monthly quota limit reached."),
          "503": errorResponse("Temporarily unavailable."),
        },
      },
    };
  }

  return {
    openapi: "3.1.0",
    info: {
      title: "Daily Panchangam API",
      version: "v1",
      description:
        `Precomputed Panchangam for ${SUPPORTED_RANGE.start} to ${SUPPORTED_RANGE.end}. ` +
        `Requires an API plan. Limits per key: ${config.ratePerMinute} requests/minute, ` +
        `${config.burstPerSecond} requests/second, ${config.maxConcurrent} concurrent; ` +
        `${config.monthlyQuota} successful requests per billing period per account.`,
    },
    servers: [{ url: "/api/v1" }],
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", description: "Authorization: Bearer <API_KEY>" } },
      schemas: {
        Error: {
          type: "object",
          required: ["success", "error", "message"],
          properties: {
            success: { const: false },
            error: { type: "string", enum: Object.keys(DEFAULT_MESSAGES) },
            message: { type: "string" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths,
  };
}
