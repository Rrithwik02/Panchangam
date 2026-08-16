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

  const todayDate = new Date().toISOString().slice(0, 10);
  return getPanchangamDateResponse(todayDate, locationResult.location);
}
