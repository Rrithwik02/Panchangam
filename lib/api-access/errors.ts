// Consistent error bodies for the paid API:
//   { "success": false, "error": "<code>", "message": "<human text>" }
// Messages never include keys, billing details, SQL or whether a record exists
// beyond what the caller needs.

export type ApiErrorCode =
  | "missing_api_key"
  | "invalid_api_key"
  | "api_access_required"
  | "rate_limit_exceeded"
  | "concurrency_limit_exceeded"
  | "monthly_quota_exceeded"
  | "too_many_requests"
  | "invalid_request"
  | "not_found"
  | "unsupported_endpoint"
  | "https_required"
  | "request_timeout"
  | "service_unavailable"
  | "internal_error";

export const DEFAULT_MESSAGES: Record<ApiErrorCode, string> = {
  missing_api_key: "Send your API key in the header: Authorization: Bearer <API_KEY>.",
  invalid_api_key: "Invalid or revoked API key.",
  api_access_required: "Active API subscription required.",
  rate_limit_exceeded: "Rate limit exceeded. Please retry later.",
  concurrency_limit_exceeded: "Too many simultaneous requests for this API key. Please retry shortly.",
  monthly_quota_exceeded: "Monthly API request limit reached.",
  too_many_requests: "Too many requests from this network. Please retry later.",
  invalid_request: "Invalid request.",
  not_found: "Panchangam data is not available for the requested date.",
  unsupported_endpoint: "This endpoint is not part of the Panchangam API.",
  https_required: "The API is only available over HTTPS.",
  request_timeout: "The request took too long. Please retry.",
  service_unavailable: "The service is temporarily unavailable. Please retry shortly.",
  internal_error: "Something went wrong. Please retry.",
};

// API responses are metered per customer: they must never be stored by a
// shared cache/CDN (which would serve them without authentication).
export const API_RESPONSE_HEADERS: Record<string, string> = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};

export function apiError(
  status: number,
  code: ApiErrorCode,
  message: string = DEFAULT_MESSAGES[code],
  headers: Record<string, string> = {}
) {
  return Response.json(
    { success: false, error: code, message },
    { status, headers: { ...API_RESPONSE_HEADERS, ...headers } }
  );
}
