import {
  buildDayResponse,
  createErrorResponse,
  filterDaysByRange,
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

  const startDate = url.searchParams.get("start_date");
  const endDate = url.searchParams.get("end_date");

  if (!startDate || !endDate) {
    return createErrorResponse(
      "INVALID_DATE_RANGE",
      "Both start_date and end_date are required."
    );
  }

  const days = filterDaysByRange(startDate, endDate);
  if (!days) {
    return createErrorResponse("INVALID_DATE_RANGE", "The supplied range is invalid.");
  }

  if (days.length === 0) {
    return createErrorResponse(
      "DATA_NOT_FOUND",
      "Panchangam data is not available for the requested date range.",
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
      start_date: startDate,
      end_date: endDate,
    },
  });
}
