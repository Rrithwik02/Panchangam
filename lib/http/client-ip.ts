// Client IP for rate limiting and privacy-safe logging. On Vercel these
// headers are set by the platform edge; behind another proxy, make sure it
// overwrites (not appends to) x-forwarded-for / x-real-ip.
export function clientIp(headers: Headers) {
  return (
    headers.get("x-real-ip")?.trim() ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
