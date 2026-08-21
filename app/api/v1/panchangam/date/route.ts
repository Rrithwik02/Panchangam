import { normalizeLocation, parseStrictDate } from "@/lib/api/panchangam";
import { getPanchangamDateResponse } from "@/lib/services/panchangam-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  if (!date) {
    return Response.json(
      {
        success: false,
        error: { code: "INVALID_DATE", message: "The date query parameter is required." },
      },
      { status: 400 }
    );
  }

  if (!parseStrictDate(date)) {
    return Response.json(
      {
        success: false,
        error: { code: "INVALID_DATE", message: "The supplied date is not valid." },
      },
      { status: 400 }
    );
  }

  const locationResult = normalizeLocation({
    latitude: url.searchParams.get("latitude"),
    longitude: url.searchParams.get("longitude"),
    timezone: url.searchParams.get("timezone"),
  });

  if (locationResult.error) {
    return locationResult.error;
  }

  return getPanchangamDateResponse(date, locationResult.location);
}
