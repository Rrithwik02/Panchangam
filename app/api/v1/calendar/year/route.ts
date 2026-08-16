import {
  buildListResponse,
  createErrorResponse,
  mapCalendarDay,
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

  const year = Number(url.searchParams.get("year"));
  if (!Number.isInteger(year) || year < 1) {
    return createErrorResponse("INVALID_YEAR", "A valid year is required.");
  }

  if (new Date(REFERENCE_DAY.date).getUTCFullYear() !== year) {
    return createErrorResponse(
      "DATA_NOT_FOUND",
      "Calendar data is not available for the requested year.",
      404
    );
  }

  return Response.json(
    buildListResponse([mapCalendarDay(REFERENCE_DAY)], locationResult.location, { year })
  );
}

