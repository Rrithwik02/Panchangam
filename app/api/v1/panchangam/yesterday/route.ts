import {
  buildDayResponse,
  createErrorResponse,
  findDayByDate,
  getYesterdayDate,
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

  const yesterdayDate = getYesterdayDate(REFERENCE_DAY.date);
  const yesterday = yesterdayDate ? findDayByDate(yesterdayDate) : null;

  if (!yesterday) {
    return createErrorResponse(
      "DATA_NOT_FOUND",
      "Panchangam data is not available for yesterday.",
      404
    );
  }

  return Response.json(buildDayResponse(yesterday, locationResult.location));
}
