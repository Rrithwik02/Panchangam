import Link from "next/link";
import { getApiConfig } from "@/lib/api-access/config";
import { endpointDocs, ERROR_DOCS } from "@/lib/api-access/docs";
import { formatPrice, SUPPORTED_RANGE } from "@/lib/billing/plans";

const code = "rounded bg-card-muted px-1.5 py-0.5 font-mono text-[0.85em]";

export default function DocsPage() {
  const config = getApiConfig();
  const endpoints = endpointDocs(config);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">API Docs</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Panchangam API v1</h1>
          <p className="mt-3 max-w-3xl text-muted">
            Machine-readable access to the same precomputed Panchangam as Pro, for every date from{" "}
            {SUPPORTED_RANGE.start} to {SUPPORTED_RANGE.end}. Requires the API plan ({formatPrice("api")}).
          </p>
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <Link href="/account/api" className="text-accent underline">
            Get an API key
          </Link>
          <Link href="/api/openapi" className="text-accent underline">
            OpenAPI JSON
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">Authentication</h2>
        <p className="mt-3 text-sm text-muted">
          Send your key in the <code className={code}>Authorization</code> header on every request, over HTTPS:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-card-muted p-4 text-xs">
{`curl -H "Authorization: Bearer sk_live_…" \\
  "https://<your-domain>/api/v1/panchangam/date?date=2026-09-23&timezone=Asia/Kolkata"`}
        </pre>
        <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-muted">
          <li>Keys are accepted only in the header. A key in the URL is rejected, because URLs leak into logs and browser history.</li>
          <li>Keep keys on your server. Never ship them in a browser page, mobile app bundle or public repository.</li>
          <li>Keys are shown once when created. Rotate by creating a new key, deploying it, then revoking the old one. Revocation takes effect immediately.</li>
        </ul>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">Limits</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted">
          <li>
            <strong className="text-foreground">{config.monthlyQuota.toLocaleString("en-IN")}</strong> successful
            requests per billing period, per account.
          </li>
          <li>
            <strong className="text-foreground">{config.ratePerMinute}</strong> requests per minute and{" "}
            <strong className="text-foreground">{config.burstPerSecond}</strong> per second, per key.
          </li>
          <li>
            <strong className="text-foreground">{config.maxConcurrent}</strong> simultaneous requests per key.
          </li>
          <li>Ranges cover at most {config.maxRangeDays} days. There is no bulk export endpoint.</li>
        </ul>
        <p className="mt-3 text-sm text-muted">
          <strong className="text-foreground">What counts:</strong> every successful (2xx) request, including ones
          served from our cache. Requests rejected for an invalid key, invalid parameters, an inactive
          subscription or a rate limit, and requests that fail on our side, don&apos;t count.
        </p>
        <p className="mt-3 text-sm text-muted">
          Successful responses include <code className={code}>X-RateLimit-Limit</code>,{" "}
          <code className={code}>X-RateLimit-Remaining</code>, <code className={code}>X-Quota-Limit</code>,{" "}
          <code className={code}>X-Quota-Remaining</code> and <code className={code}>X-Quota-Reset</code>. 429 and
          503 responses include <code className={code}>Retry-After</code> (seconds). Please honour it.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Endpoints</h2>
        <p className="mt-2 text-sm text-muted">
          All endpoints are <code className={code}>GET</code> under <code className={code}>/api/v1</code>. Unknown
          query parameters are rejected.
        </p>
        <div className="mt-4 space-y-3">
          {endpoints.map((endpoint) => (
            <div key={endpoint.path} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
              <p className="font-mono font-semibold">GET /api/v1{endpoint.path}</p>
              <p className="mt-1 text-muted">{endpoint.summary}</p>
              <ul className="mt-2 space-y-0.5 text-xs text-muted">
                {endpoint.params.map((p) => (
                  <li key={p.name}>
                    <code className={code}>{p.name}</code> {p.required ? "(required)" : "(optional)"} — {p.description}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">Errors</h2>
        <p className="mt-2 text-sm text-muted">
          Errors share one shape:{" "}
          <code className={code}>{`{ "success": false, "error": "rate_limit_exceeded", "message": "…" }`}</code>
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">error</th>
                <th className="py-2">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {ERROR_DOCS.map((e) => (
                <tr key={e.code}>
                  <td className="py-2 pr-4">{e.status}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{e.code}</td>
                  <td className="py-2 text-muted">{e.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">Location and data</h2>
        <p className="mt-3 text-sm text-muted">
          Panchangam values are precomputed per date. <code className={code}>timezone</code> decides which date
          &quot;today&quot;, &quot;yesterday&quot; and &quot;tomorrow&quot; mean; latitude and longitude are
          echoed in the response metadata. Responses contain only the documented Panchangam fields.
        </p>
      </section>
    </main>
  );
}
