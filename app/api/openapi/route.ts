const openapi = {
  openapi: "3.1.0",
  info: {
    title: "Daily Panchangam API",
    version: "v1",
    description:
      "Versioned Panchangam API. Current implementation serves reference/precomputed data and validates location parameters.",
  },
  servers: [{ url: "/api/v1" }],
  paths: {
    "/panchangam/today": { get: { summary: "Get today's Panchangam" } },
    "/panchangam/yesterday": { get: { summary: "Get yesterday's Panchangam" } },
    "/panchangam/tomorrow": { get: { summary: "Get tomorrow's Panchangam" } },
    "/panchangam/date": { get: { summary: "Get Panchangam by date" } },
    "/panchangam/range": { get: { summary: "Get Panchangam for a date range" } },
    "/panchangam/month": { get: { summary: "Get Panchangam for a month" } },
    "/calendar/date": { get: { summary: "Get calendar summary for a date" } },
    "/calendar/month": { get: { summary: "Get calendar summary for a month" } },
    "/calendar/year": { get: { summary: "Get calendar summary for a year" } },
    "/festivals/date": { get: { summary: "Get festivals for a date" } },
    "/festivals/month": { get: { summary: "Get festivals for a month" } },
    "/festivals/year": { get: { summary: "Get festivals for a year" } },
    "/tithis/date": { get: { summary: "Get tithi details for a date" } },
    "/tithis/search": { get: { summary: "Search tithis" } },
    "/nakshatras/date": { get: { summary: "Get nakshatra details for a date" } },
    "/nakshatras/search": { get: { summary: "Search nakshatras" } },
    "/yogas/date": { get: { summary: "Get yoga details for a date" } },
    "/yogas/search": { get: { summary: "Search yogas" } },
    "/karanas/date": { get: { summary: "Get karana details for a date" } },
    "/karanas/search": { get: { summary: "Search karanas" } },
  },
};

export async function GET() {
  return Response.json(openapi);
}

