import {
  buildDayResponse,
  createErrorResponse,
  findDayByDate,
  getTomorrowDate,
  normalizeLocation,
  REFERENCE_DAY,
} from "@/lib/api/panchangam";

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

  const tomorrowDate = getTomorrowDate(REFERENCE_DAY.date);
  const tomorrow = tomorrowDate ? findDayByDate(tomorrowDate) : null;

  if (!tomorrow) {
    return createErrorResponse(
      "DATA_NOT_FOUND",
      "Panchangam data is not available for tomorrow.",
      404
    );
  }

  return Response.json(buildDayResponse(tomorrow, locationResult.location));
}
