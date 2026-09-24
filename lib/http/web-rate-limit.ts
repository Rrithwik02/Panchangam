import "server-only";

import { getApiConfig } from "@/lib/api-access/config";
import { WindowCounter } from "@/lib/api-access/memory-limiter";
import { jsonError } from "@/lib/auth/request";
import { clientIp } from "@/lib/http/client-ip";

// Per-instance flood protection for the website's own Panchangam endpoints.
// Real visitors make a handful of requests per page; this only stops scripts
// from using the website endpoints as a free, unmetered API.
let counter: WindowCounter | null = null;

export function webRateLimit(request: Request): Response | null {
  counter ??= new WindowCounter(getApiConfig().webRequestsPerMinute, 60_000);
  const wait = counter.hit(clientIp(request.headers));
  if (!wait) return null;

  const response = jsonError("RATE_LIMITED", "Too many requests. Please slow down.", 429);
  response.headers.set("Retry-After", String(wait));
  return response;
}
