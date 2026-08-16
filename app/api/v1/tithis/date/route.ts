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

  return Response.json(
    buildListResponse(
      [
        {
          date: REFERENCE_DAY.date,
          label: "tithi",
          value: `${REFERENCE_DAY.tithi} (${REFERENCE_DAY.paksha})`,
        },
      ],
      locationResult.location
    )
  );
}
