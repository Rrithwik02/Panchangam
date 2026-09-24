# Panchangam

Today's Panchangam, beautifully simplified.

A modern web landing page for Panchangam — a premium Panchangam experience that makes traditional information easy to understand and use, plus a versioned API scaffold.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

## Pages

- `/` — Marketing landing page
- `/today` — Today's Panchangam (stub product page)
- `/premium` — Premium information
- `/docs` — API documentation
- `/about`, `/contact`, `/privacy`, `/terms` — Footer pages

## API

The paid API (₹600/month, separate from website Pro) lives under `/api/v1/`:
Panchangam today / yesterday / tomorrow / date / range (≤31 days) / month, plus
calendar and festivals by month. Docs: `/docs` and `/api/openapi`. Customers
manage keys and see usage at `/account/api`.

Every request goes through `lib/api-access`: Bearer key → strict validation →
one Postgres call (`api_authorize`: key hash, revocation, API subscription,
burst / per-minute / concurrency limits, quota reservation) → cached,
explicit-column Supabase read → `api_finish` (release slot, refund failed
requests, log, key-sharing check). The website uses `/api/web/*` instead.

Database: run `supabase/migrations/20260925000000_api_access_layer.sql` (after
the auth migration). It also removes anon/authenticated access to
`daily_panchangam`, so `SUPABASE_SECRET_KEY` must be set on the server first.

Limits are environment variables (defaults in `lib/api-access/config.ts`):
`API_MONTHLY_QUOTA`, `API_RATE_LIMIT_PER_MINUTE`, `API_BURST_LIMIT_PER_SECOND`,
`API_MAX_CONCURRENT_REQUESTS`, `API_REQUEST_TIMEOUT_MS`, `API_DB_TIMEOUT_MS`,
`API_MAX_RANGE_DAYS`, `API_MAX_ACTIVE_KEYS`, `API_CACHE_TTL_SECONDS`,
`API_CACHE_MAX_ENTRIES`, `API_IP_LIMIT_PER_MINUTE`, `API_IP_AUTH_FAILURES_PER_MINUTE`,
`API_IP_BLOCK_SECONDS`, `WEB_IP_LIMIT_PER_MINUTE`, `API_ANOMALY_*`, `API_IP_HASH_SALT`.

Internal metrics (SQL editor, service role only): `api_admin_hourly`,
`api_admin_top_users_30d`, `api_admin_top_endpoints_24h`.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Radix UI (Accordion, Dialog)
- System font stack

## Build

```bash
npm run build
npm start
```

Run the tests (build, HTTP contract, Pro rules, and the API layer against the real SQL in PGlite):

```bash
npm test
```
