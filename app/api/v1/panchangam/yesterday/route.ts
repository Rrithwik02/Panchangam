import { normalizeLocation } from "@/lib/api/panchangam";
import { getPanchangamYesterday } from "@/lib/services/panchangam-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  return getPanchangamYesterday(locationResult.location);
}
