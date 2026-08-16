import { normalizeLocation } from "@/lib/api/panchangam";
import { getCalendarDateResponse } from "@/lib/services/panchangam-service";

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

  return getCalendarDateResponse(locationResult.location);
}
