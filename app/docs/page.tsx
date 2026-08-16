import Link from "next/link";

const endpoints = [
  "/api/v1/panchangam/today",
  "/api/v1/panchangam/yesterday",
  "/api/v1/panchangam/tomorrow",
  "/api/v1/panchangam/date",
  "/api/v1/panchangam/range",
  "/api/v1/panchangam/month",
  "/api/v1/calendar/date",
  "/api/v1/calendar/month",
  "/api/v1/calendar/year",
  "/api/v1/festivals/date",
  "/api/v1/festivals/month",
  "/api/v1/festivals/year",
  "/api/v1/tithis/date",
  "/api/v1/tithis/search",
  "/api/v1/nakshatras/date",
  "/api/v1/nakshatras/search",
  "/api/v1/yogas/date",
  "/api/v1/yogas/search",
  "/api/v1/karanas/date",
  "/api/v1/karanas/search",
];

export default function DocsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            API Docs
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Panchangam API v1
          </h1>
          <p className="mt-3 max-w-3xl text-muted">
            This API is versioned, location-aware, and intentionally honest about
            the current data source. The repository currently serves reference
            Panchangam data and validates latitude, longitude, and timezone
            inputs, but it does not yet contain a real astronomical engine.
          </p>
        </div>
        <Link href="/api/openapi" className="text-sm font-medium text-accent underline">
          OpenAPI JSON
        </Link>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">Location contract</h2>
        <p className="mt-3 text-sm text-muted">
          Send `latitude`, `longitude`, and `timezone` with every location-aware
          request. If browser permission is denied, the frontend can fall back to
          timezone-only reference data, but the API will not claim a dynamic
          astronomical recalculation unless one actually exists.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          <li>`latitude`: -90 to 90</li>
          <li>`longitude`: -180 to 180</li>
          <li>`timezone`: valid IANA timezone such as `Asia/Kolkata`</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Endpoints</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {endpoints.map((endpoint) => (
            <div
              key={endpoint}
              className="rounded-xl border border-border bg-card-muted px-4 py-3 text-sm"
            >
              {endpoint}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">Data limitations</h2>
        <p className="mt-3 text-sm text-muted">
          The current repository does not include a live Supabase schema or an
          astronomical calculation engine. All responses are routed through a
          reference data layer and are labeled accordingly in response metadata.
        </p>
      </section>
    </main>
  );
}

