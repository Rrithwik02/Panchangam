import { normalizeLocation } from "@/lib/api/panchangam";
import { getPanchangamDateResponse } from "@/lib/services/panchangam-service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locationResult = normalizeLocation({
    latitude: url.searchParams.get("latitude"),
    longitude: url.searchParams.get("longitude"),
    timezone: url.searchParams.get("timezone"),
  });

  if (locationResult.error) {
    return locationResult.error;
  }

  const tomorrowDate = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  return getPanchangamDateResponse(tomorrowDate, locationResult.location);
}
