import {
  buildListResponse,
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

  const name = url.searchParams.get("name")?.trim().toLowerCase() ?? "";
  const number = url.searchParams.get("number")?.trim() ?? "";

  const matches =
    (!name || REFERENCE_DAY.karana.toLowerCase().includes(name)) &&
    (!number || REFERENCE_DAY.karana.toLowerCase().includes(number.toLowerCase()));

  return Response.json(
    buildListResponse(
      matches
        ? [
            {
              date: REFERENCE_DAY.date,
              label: "karana",
              value: REFERENCE_DAY.karana,
            },
          ]
        : [],
      locationResult.location
    )
  );
}

