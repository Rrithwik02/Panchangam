import { normalizeLocation } from "@/lib/api/panchangam";
import { getPanchangamRangeResponse } from "@/lib/services/panchangam-service";

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
    return Response.json(
      {
        success: false,
        error: {
          code: "INVALID_DATE_RANGE",
          message: "Both start_date and end_date are required.",
        },
      },
      { status: 400 }
    );
  }

  return getPanchangamRangeResponse(startDate, endDate, locationResult.location);
}
