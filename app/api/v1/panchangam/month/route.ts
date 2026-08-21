import { normalizeLocation } from "@/lib/api/panchangam";
import { getPanchangamMonthResponse } from "@/lib/services/panchangam-service";

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

  const year = Number(url.searchParams.get("year"));
  const month = Number(url.searchParams.get("month"));

  if (!Number.isInteger(year) || year < 1) {
    return Response.json(
      {
        success: false,
        error: { code: "INVALID_YEAR", message: "A valid year is required." },
      },
      { status: 400 }
    );
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return Response.json(
      {
        success: false,
        error: { code: "INVALID_MONTH", message: "A valid month is required." },
      },
      { status: 400 }
    );
  }

  return getPanchangamMonthResponse(year, month, locationResult.location);
}
