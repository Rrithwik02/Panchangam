import { normalizeLocation } from "@/lib/api/panchangam";
import { getFestivalYearResponse } from "@/lib/services/panchangam-service";

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

  const year = Number(url.searchParams.get("year"));
  if (!Number.isInteger(year) || year < 1) {
    return Response.json(
      { success: false, error: { code: "INVALID_YEAR", message: "A valid year is required." } },
      { status: 400 }
    );
  }

  return getFestivalYearResponse(year, locationResult.location);
}
