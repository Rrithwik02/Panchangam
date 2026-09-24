import { normalizeLocation } from "@/lib/api/panchangam";
import { getPanchangamToday } from "@/lib/services/panchangam-service";
import { webRateLimit } from "@/lib/http/web-rate-limit";
import { PRIVATE_NO_STORE } from "@/lib/auth/request";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Website Today view (full Panchangam for every visitor). Not part of the paid
// API: rate limited per IP and served from the server-side Panchangam cache.
export async function GET(request: Request) {
  const limited = webRateLimit(request);
  if (limited) return limited;

  const url = new URL(request.url);
  const locationResult = normalizeLocation({
    latitude: url.searchParams.get("latitude"),
    longitude: url.searchParams.get("longitude"),
    timezone: url.searchParams.get("timezone"),
  });
  if (locationResult.error) return locationResult.error;

  const response = await getPanchangamToday(locationResult.location);
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", PRIVATE_NO_STORE["Cache-Control"]);
  return new Response(response.body, { status: response.status, headers });
}
