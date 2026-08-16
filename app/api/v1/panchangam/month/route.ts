import {
  buildDayResponse,
  createErrorResponse,
  filterDaysByMonth,
  normalizeLocation,
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
  const month = Number(url.searchParams.get("month"));

  if (!Number.isInteger(year) || year < 1) {
    return createErrorResponse("INVALID_YEAR", "A valid year is required.");
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return createErrorResponse("INVALID_MONTH", "A valid month is required.");
  }

  const days = filterDaysByMonth(year, month);
  if (days.length === 0) {
    return createErrorResponse(
      "DATA_NOT_FOUND",
      "Panchangam data is not available for the requested month.",
      404
    );
  }

  return Response.json({
    success: true,
    data: {
      items: days.map((day) => buildDayResponse(day, locationResult.location).data),
      total_records: days.length,
    },
    meta: {
      location: locationResult.location,
      calculation_source: "precomputed" as const,
      year,
      month,
    },
  });
}

