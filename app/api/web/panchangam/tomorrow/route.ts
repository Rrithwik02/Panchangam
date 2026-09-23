import { getTomorrowDateForTimezone, normalizeLocation } from "@/lib/api/panchangam";
import { getWebPanchangamForDate } from "@/lib/billing/web-panchangam";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Website Tomorrow view: full Panchangam for Pro, the existing preview for Free.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const locationResult = normalizeLocation({
    latitude: url.searchParams.get("latitude"),
    longitude: url.searchParams.get("longitude"),
    timezone: url.searchParams.get("timezone"),
  });
  if (locationResult.error) return locationResult.error;

  const date = getTomorrowDateForTimezone(locationResult.location.timezone);
  if (!date) {
    return Response.json(
      { success: false, error: { code: "INVALID_TIMEZONE", message: "The supplied timezone is not valid." } },
      { status: 400 }
    );
  }

  return getWebPanchangamForDate(url, date);
}
