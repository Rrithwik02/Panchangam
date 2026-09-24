// Paid API access layer: the real request pipeline (lib/api-access) running
// against the real SQL migrations in an in-process Postgres (PGlite), with a
// local stand-in for PostgREST serving daily_panchangam rows.
//
// node --experimental-strip-types --import ./tests/support/register.mjs --test tests/api-access.test.mjs
import assert from "node:assert/strict";
import http from "node:http";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { asRole, createTestDb, createUser } from "./support/test-db.mjs";

// ---------------------------------------------------------------------------
// Stand-in PostgREST for daily_panchangam (counts every database read)
// ---------------------------------------------------------------------------
const rest = { hits: [], mode: "ok", delayMs: 0 };

function rowFor(date) {
  return {
    date,
    vara: "Wednesday",
    samvatsara: "Vishvavasu",
    masa: "Bhadrapada",
    ritu: "Varsha",
    ayana: "Dakshinayana",
    sunrise: "06:05",
    sunset: "18:12",
    tithi1_name: "Saptami",
    tithi1_paksha: "Shukla",
    tithi1_end_time: "14:20",
    nakshatra1_name: "Jyeshtha",
    rahukalam: "12:08 - 13:39",
    festival_occasion: "Test Festival",
  };
}

function datesBetween(start, end) {
  const out = [];
  for (let d = new Date(`${start}T00:00:00Z`); d <= new Date(`${end}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

const restServer = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  rest.hits.push(url.pathname + url.search);
  if (rest.delayMs) await new Promise((r) => setTimeout(r, rest.delayMs));
  if (rest.mode === "fail") {
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ message: "database is down" }));
    return;
  }

  const dates = url.searchParams.getAll("date");
  let rows = [];
  const eq = dates.find((d) => d.startsWith("eq."));
  if (eq) rows = [rowFor(eq.slice(3))];
  const gte = dates.find((d) => d.startsWith("gte."));
  const lte = dates.find((d) => d.startsWith("lte."));
  if (gte && lte) rows = datesBetween(gte.slice(4), lte.slice(4)).map(rowFor);

  const wantsObject = String(req.headers.accept ?? "").includes("vnd.pgrst.object");
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify(wantsObject ? rows[0] ?? null : rows));
});

await new Promise((resolve) => restServer.listen(0, "127.0.0.1", resolve));
process.env.SUPABASE_URL = `http://127.0.0.1:${restServer.address().port}`;
process.env.SUPABASE_SECRET_KEY = "test-service-role-key-never-exposed";

const { createApiHandler } = await import("../lib/api-access/handler.ts");
const endpoints = await import("../lib/api-access/endpoints.ts");
const { generateApiKey, hashApiKey, extractBearerKey } = await import("../lib/api-access/keys.ts");
const { getApiConfig } = await import("../lib/api-access/config.ts");
const { MemoryCache } = await import("../lib/cache/memory-cache.ts");
const repo = await import("../lib/repositories/panchangam-repository.ts");
const breaker = await import("../lib/supabase/circuit-breaker.ts");
const { hasApiAccess } = await import("../lib/billing/access-rules.ts");

// ---------------------------------------------------------------------------
// Database, users and keys
// ---------------------------------------------------------------------------
let db;
const logs = [];
const secrets = [];

const store = {
  failNext: 0,
  async authorize(a) {
    if (this.failNext > 0) {
      this.failNext--;
      throw new Error("connection refused");
    }
    const r = await db.query("select public.api_authorize($1,$2,$3,$4,$5,$6,$7,$8) as r", [
      a.p_key_hash, a.p_request_id, a.p_quota, a.p_per_second, a.p_per_minute,
      a.p_max_concurrent, a.p_slot_ttl_seconds, a.p_log,
    ]);
    return r.rows[0].r;
  },
  async finish(a) {
    await db.query("select public.api_finish($1,$2,$3,$4,$5,$6,$7)", [
      a.p_request_id, a.p_key_id, a.p_user_id, a.p_period_start, a.p_success, a.p_log, a.p_anomaly,
    ]);
  },
};

const health = {
  isOpen: () => breaker.isDatabaseCircuitOpen(),
  retryAfterSeconds: () => breaker.databaseCircuitRetryAfterSeconds(),
  success: breaker.recordDatabaseSuccess,
  failure: () => breaker.recordDatabaseFailure(),
};

function makeHandler(overrides = {}, extra = {}) {
  return createApiHandler({
    config: { ...getApiConfig(), ...overrides },
    store,
    health,
    ipHashSalt: "test-salt",
    logger: (entry) => logs.push(JSON.stringify(entry)),
    isProduction: true,
    ...extra,
  });
}

function req(path, { key, ip = "203.0.113.10", headers = {} } = {}) {
  return new Request(`https://api.example.test/api/v1${path}`, {
    headers: {
      "x-forwarded-proto": "https",
      "x-real-ip": ip,
      "user-agent": "api-tests/1.0",
      ...(key ? { authorization: `Bearer ${key}` } : {}),
      ...headers,
    },
  });
}

const TZ = "timezone=Asia/Kolkata";
let userSeq = 0;

async function newUser({ api, pro } = {}) {
  const id = randomUUID();
  await createUser(db, id, `user${++userSeq}@example.test`);
  if (pro) {
    await db.query(
      "update public.subscriptions set plan='pro', status='active', current_period_end=now()+interval '20 days' where user_id=$1",
      [id]
    );
  }
  if (api) {
    const end = api.end ?? "now() + interval '20 days'";
    await db.query(
      `insert into public.api_subscriptions (user_id, status, current_period_start, current_period_end)
       values ($1, $2, now() - interval '10 days', ${end})`,
      [id, api.status ?? "active"]
    );
  }
  return id;
}

/** Creates a key through the real SQL function (or directly, for non-entitled users). */
async function newKey(userId, { direct = false } = {}) {
  const key = generateApiKey("test");
  secrets.push(key.secret);
  if (direct) {
    await db.query("insert into public.api_keys (user_id, name, key_prefix, key_hash) values ($1,'k',$2,$3)", [
      userId, key.prefix, key.hash,
    ]);
  } else {
    const r = await db.query("select public.api_create_key($1,'k',$2,$3,3) as r", [userId, key.prefix, key.hash]);
    assert.equal(r.rows[0].r.ok, true, JSON.stringify(r.rows[0].r));
  }
  return key.secret;
}

async function apiKeyUser() {
  const user = await newUser({ api: {} });
  return { user, key: await newKey(user) };
}

async function usage(userId) {
  const r = await db.query("select coalesce(sum(used),0)::int as used from public.api_usage_periods where user_id=$1", [userId]);
  return r.rows[0].used;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function alignToStartOf(windowMs, usableMs) {
  const offset = Date.now() % windowMs;
  if (offset > windowMs - usableMs) await sleep(windowMs - offset + 20);
}

before(async () => {
  db = await createTestDb();
});

after(async () => {
  restServer.close();
  await db?.close();
});

// ---------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------
test("keys are 256-bit, prefixed, and only their SHA-256 hash is stored", async () => {
  const k = generateApiKey("live");
  assert.match(k.secret, /^sk_live_[A-Za-z0-9_-]{43}$/);
  assert.equal(k.prefix, k.secret.slice(0, 14));
  assert.equal(k.hash, hashApiKey(k.secret));
  assert.notEqual(generateApiKey().secret, generateApiKey().secret);

  const { user, key } = await apiKeyUser();
  const rows = await db.query("select * from public.api_keys where user_id=$1", [user]);
  const stored = JSON.stringify(rows.rows);
  assert.ok(!stored.includes(key), "raw key must never be stored");
  assert.equal(rows.rows[0].key_hash, hashApiKey(key));
});

test("Authorization: Bearer is the only accepted credential format", () => {
  const good = generateApiKey().secret;
  assert.equal(extractBearerKey(new Headers()).kind, "missing");
  assert.equal(extractBearerKey(new Headers({ authorization: good })).kind, "malformed");
  assert.equal(extractBearerKey(new Headers({ authorization: "Bearer sk_live_short" })).kind, "malformed");
  assert.equal(extractBearerKey(new Headers({ authorization: `Basic ${good}` })).kind, "malformed");
  assert.deepEqual(extractBearerKey(new Headers({ authorization: `Bearer ${good}` })), { kind: "ok", secret: good });
});

// 1, 6 ----------------------------------------------------------------------
test("valid key with an active API subscription gets data, counted once", async () => {
  const { user, key } = await apiKeyUser();
  const res = await makeHandler()(endpoints.panchangamDate)(req(`/panchangam/date?date=2026-09-23&${TZ}`, { key }));
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.date, "2026-09-23");
  assert.equal(body.data.tithi, "Saptami");
  assert.equal(body.meta.access, "full");
  assert.equal(res.headers.get("cache-control"), "private, no-store");
  assert.equal(res.headers.get("x-quota-limit"), "10000");
  assert.equal(res.headers.get("x-quota-remaining"), "9999");
  assert.equal(res.headers.get("x-ratelimit-limit"), "60");
  assert.equal(await usage(user), 1);

  // Only documented fields — no raw database columns.
  assert.equal(body.data.tithi1_name, undefined);
  assert.equal(body.data.festival_occasion, undefined);
  assert.deepEqual(body.data.festivals, ["Test Festival"]);
});

test("API Tomorrow is the full day (no Free preview for API customers)", async () => {
  const { key } = await apiKeyUser();
  const res = await makeHandler()(endpoints.panchangamTomorrow)(req(`/panchangam/tomorrow?${TZ}`, { key }));
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.meta.access, "full");
  assert.ok(body.data.sunrise);
});

test("cancelled subscription keeps working until the paid period ends", async () => {
  const user = await newUser({ api: { status: "cancelled" } });
  const key = await newKey(user, { direct: true });
  const res = await makeHandler()(endpoints.panchangamDate)(req(`/panchangam/date?date=2026-09-23&${TZ}`, { key }));
  assert.equal(res.status, 200);
});

// 2 ------------------------------------------------------------------------
test("missing, malformed and unknown keys are rejected with 401", async () => {
  const h = makeHandler()(endpoints.panchangamDate);
  const path = `/panchangam/date?date=2026-09-23&${TZ}`;

  const missing = await h(req(path, { ip: "198.51.100.1" }));
  assert.equal(missing.status, 401);
  assert.equal((await missing.json()).error, "missing_api_key");
  assert.match(missing.headers.get("www-authenticate"), /^Bearer/);

  const malformed = await h(req(path, { key: "not-a-key", ip: "198.51.100.1" }));
  assert.equal(malformed.status, 401);
  assert.deepEqual(await malformed.json(), {
    success: false,
    error: "invalid_api_key",
    message: "Invalid or revoked API key.",
  });

  const unknown = await h(req(path, { key: generateApiKey().secret, ip: "198.51.100.1" }));
  assert.equal(unknown.status, 401);
  assert.equal((await unknown.json()).error, "invalid_api_key");
});

test("a key in the URL is refused and never needed", async () => {
  const { key } = await apiKeyUser();
  const res = await makeHandler()(endpoints.panchangamDate)(
    req(`/panchangam/date?date=2026-09-23&${TZ}&api_key=${key}`)
  );
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.message, /Authorization header/);
  assert.ok(!JSON.stringify(body).includes(key));
});

test("plain HTTP is refused in production", async () => {
  const { key } = await apiKeyUser();
  const res = await makeHandler()(endpoints.panchangamDate)(
    req(`/panchangam/date?date=2026-09-23&${TZ}`, { key, headers: { "x-forwarded-proto": "http" } })
  );
  assert.equal(res.status, 403);
  assert.equal((await res.json()).error, "https_required");
});

// 3, 19 --------------------------------------------------------------------
test("revoked key stops working on its very next request; rotation works", async () => {
  const { user, key: oldKey } = await apiKeyUser();
  const h = makeHandler()(endpoints.panchangamDate);
  const path = `/panchangam/date?date=2026-09-23&${TZ}`;

  assert.equal((await h(req(path, { key: oldKey }))).status, 200);

  const newKeySecret = await newKey(user);
  await db.query("update public.api_keys set revoked_at=now(), revoked_reason='user' where key_hash=$1", [hashApiKey(oldKey)]);

  const revoked = await h(req(path, { key: oldKey }));
  assert.equal(revoked.status, 401);
  assert.equal((await revoked.json()).error, "invalid_api_key");
  assert.equal((await h(req(path, { key: newKeySecret }))).status, 200);

  // Row kept for audit, not deleted.
  const kept = await db.query("select revoked_at from public.api_keys where key_hash=$1", [hashApiKey(oldKey)]);
  assert.ok(kept.rows[0].revoked_at);
});

test("active keys per account are capped", async () => {
  const user = await newUser({ api: {} });
  for (let i = 0; i < 3; i++) await newKey(user);
  const extra = generateApiKey();
  const r = await db.query("select public.api_create_key($1,'k',$2,$3,3) as r", [user, extra.prefix, extra.hash]);
  assert.deepEqual(r.rows[0].r, { ok: false, error: "too_many_keys" });
});

test("keys can't be created without an API subscription", async () => {
  const user = await newUser({ pro: true });
  const k = generateApiKey();
  const r = await db.query("select public.api_create_key($1,'k',$2,$3,3) as r", [user, k.prefix, k.hash]);
  assert.deepEqual(r.rows[0].r, { ok: false, error: "api_access_required" });
});

// 4, 5, 7 ------------------------------------------------------------------
for (const [label, options] of [
  ["Free user", {}],
  ["Pro user (website plan only)", { pro: true }],
  ["expired API subscription", { api: { status: "expired" } }],
  ["payment_failed API subscription", { api: { status: "payment_failed" } }],
  ["active subscription past its period end", { api: { end: "now() - interval '1 minute'" } }],
  ["cancelled subscription after its period end", { api: { status: "cancelled", end: "now() - interval '1 minute'" } }],
]) {
  test(`${label} is refused with 403 and uses no quota`, async () => {
    const user = await newUser(options);
    const key = await newKey(user, { direct: true });
    const res = await makeHandler()(endpoints.panchangamDate)(req(`/panchangam/date?date=2026-09-23&${TZ}`, { key }));
    assert.equal(res.status, 403);
    assert.deepEqual(await res.json(), {
      success: false,
      error: "api_access_required",
      message: "Active API subscription required.",
    });
    assert.equal(await usage(user), 0);
  });
}

test("the TypeScript and SQL entitlement rules agree", async () => {
  const now = new Date();
  const future = new Date(now.getTime() + 86_400_000).toISOString();
  const past = new Date(now.getTime() - 86_400_000).toISOString();
  for (const status of ["active", "cancelled", "expired", "payment_failed"]) {
    for (const end of [future, past, null]) {
      const r = await db.query("select public.api_is_entitled($1,$2,$3) as ok", [status, end, now.toISOString()]);
      assert.equal(r.rows[0].ok, hasApiAccess({ status, current_period_end: end }, now), `${status} ${end}`);
    }
  }
});

// 8 ------------------------------------------------------------------------
test("monthly quota: request 10,000 succeeds, 10,001 gets 429 monthly_quota_exceeded", async () => {
  const { user, key } = await apiKeyUser();
  const h = makeHandler()(endpoints.panchangamDate);
  const path = `/panchangam/date?date=2026-09-23&${TZ}`;

  assert.equal((await h(req(path, { key }))).status, 200);
  await db.query("update public.api_usage_periods set used = 9999 where user_id=$1", [user]);

  const last = await h(req(path, { key }));
  assert.equal(last.status, 200);
  assert.equal(last.headers.get("x-quota-remaining"), "0");

  const over = await h(req(path, { key }));
  assert.equal(over.status, 429);
  assert.deepEqual(await over.json(), {
    success: false,
    error: "monthly_quota_exceeded",
    message: "Monthly API request limit reached.",
  });
  assert.ok(Number(over.headers.get("retry-after")) > 0);
  assert.equal(await usage(user), 10_000);
});

test("rejected and failed requests don't consume quota", async () => {
  const { user, key } = await apiKeyUser();
  const h = makeHandler();

  assert.equal((await h(endpoints.panchangamDate)(req(`/panchangam/date?date=bad&${TZ}`, { key }))).status, 400);
  assert.equal((await h(endpoints.panchangamDate)(req(`/panchangam/date?date=2026-09-23`, { key }))).status, 400);

  rest.mode = "fail";
  repo.clearPanchangamCacheForTests();
  try {
    const failed = await h(endpoints.panchangamDate)(req(`/panchangam/date?date=2031-01-01&${TZ}`, { key }));
    assert.equal(failed.status, 503);
  } finally {
    rest.mode = "ok";
    breaker.resetDatabaseCircuitForTests();
  }
  assert.equal(await usage(user), 0);

  assert.equal((await h(endpoints.panchangamDate)(req(`/panchangam/date?date=2026-09-23&${TZ}`, { key }))).status, 200);
  assert.equal(await usage(user), 1);
});

// 9 ------------------------------------------------------------------------
test("60 requests/minute per key is enforced across instances", async () => {
  const { key } = await apiKeyUser();
  // Three "serverless instances" sharing only the database.
  const instances = [0, 1, 2].map(() => makeHandler({ burstPerSecond: 1000, maxConcurrent: 100 })(endpoints.panchangamDate));
  const path = `/panchangam/date?date=2026-09-23&${TZ}`;

  await alignToStartOf(60_000, 20_000);
  for (let i = 0; i < 60; i++) {
    const res = await instances[i % 3](req(path, { key }));
    assert.equal(res.status, 200, `request ${i + 1}`);
  }
  const res = await instances[0](req(path, { key }));
  assert.equal(res.status, 429);
  assert.equal((await res.json()).error, "rate_limit_exceeded");
  assert.ok(Number(res.headers.get("retry-after")) >= 1);
});

// 10 -----------------------------------------------------------------------
test("5 requests/second burst per key, enforced by the database and locally", async () => {
  const path = `/panchangam/date?date=2026-09-23&${TZ}`;

  // Across two instances: only the shared database sees all six.
  const shared = await apiKeyUser();
  const a = makeHandler({ maxConcurrent: 100 })(endpoints.panchangamDate);
  const b = makeHandler({ maxConcurrent: 100 })(endpoints.panchangamDate);
  await alignToStartOf(1000, 600);
  const statuses = [];
  for (let i = 0; i < 6; i++) statuses.push((await (i % 2 ? b : a)(req(path, { key: shared.key }))).status);
  assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429]);

  // One instance: the 6th never reaches the database.
  const local = await apiKeyUser();
  const h = makeHandler({ maxConcurrent: 100 })(endpoints.panchangamDate);
  await alignToStartOf(1000, 600);
  const burst = await Promise.all(Array.from({ length: 6 }, () => h(req(path, { key: local.key }))));
  assert.equal(burst.filter((r) => r.status === 429).length >= 1, true);
  assert.equal(await usage(local.user) <= 5, true);
});

test("rate limits and quota are independent: quota left doesn't bypass the rate limit", async () => {
  const { user, key } = await apiKeyUser();
  await makeHandler()(endpoints.panchangamDate)(req(`/panchangam/date?date=2026-09-23&${TZ}`, { key }));
  await db.query("update public.api_usage_periods set used = 1 where user_id=$1", [user]);
  const h = makeHandler({ maxConcurrent: 100 })(endpoints.panchangamDate);
  await alignToStartOf(1000, 600);
  const results = await Promise.all(
    Array.from({ length: 30 }, () => h(req(`/panchangam/date?date=2026-09-23&${TZ}`, { key })))
  );
  assert.ok(results.some((r) => r.status === 429));
  assert.ok(results.filter((r) => r.status === 200).length <= 5);
});

// 11 -----------------------------------------------------------------------
test("maximum 2 simultaneous requests per key", async () => {
  const { key } = await apiKeyUser();
  let release;
  const gate = new Promise((r) => (release = r));
  const slow = {
    ...endpoints.panchangamDate,
    async run(params) {
      await gate;
      return endpoints.panchangamDate.run(params);
    },
  };
  const h = makeHandler()(slow);
  const path = `/panchangam/date?date=2026-09-23&${TZ}`;

  const first = h(req(path, { key }));
  const second = h(req(path, { key }));
  await sleep(100);
  const third = await h(req(path, { key }));
  assert.equal(third.status, 429);
  assert.equal((await third.json()).error, "concurrency_limit_exceeded");

  release();
  assert.equal((await first).status, 200);
  assert.equal((await second).status, 200);
  await sleep(1100); // new burst window
  assert.equal((await h(req(path, { key }))).status, 200, "slots are released after completion");
});

test("a request can't run forever: 504 after the timeout, quota refunded", async () => {
  const { user, key } = await apiKeyUser();
  const hang = { ...endpoints.panchangamDate, run: () => new Promise(() => {}) };
  const res = await makeHandler({ requestTimeoutMs: 300 })(hang)(req(`/panchangam/date?date=2026-09-23&${TZ}`, { key }));
  assert.equal(res.status, 504);
  assert.equal((await res.json()).error, "request_timeout");
  assert.equal(await usage(user), 0);
  const inflight = await db.query("select count(*)::int as n from public.api_inflight");
  assert.equal(inflight.rows[0].n, 0);
});

// 12, 13, 14 ----------------------------------------------------------------
test("invalid, unsupported and injection-style parameters are rejected before the database", async () => {
  const { user, key } = await apiKeyUser();
  const h = makeHandler();
  const bad = [
    [endpoints.panchangamDate, "/panchangam/date?date=2026-02-30&" + TZ],
    [endpoints.panchangamDate, "/panchangam/date?date=2026-9-1&" + TZ],
    [endpoints.panchangamDate, "/panchangam/date?date=" + encodeURIComponent("2026-09-23' OR 1=1--") + "&" + TZ],
    [endpoints.panchangamDate, "/panchangam/date?date=2026-09-23&timezone=" + encodeURIComponent("Asia/Kolkata;DROP TABLE x")],
    [endpoints.panchangamDate, "/panchangam/date?date=2026-09-23&" + TZ + "&select=*"],
    [endpoints.panchangamDate, "/panchangam/date?date=2026-09-23&date=2026-09-24&" + TZ],
    [endpoints.panchangamDate, "/panchangam/date?date=2026-09-23&" + TZ + "&latitude=12"],
    [endpoints.panchangamDate, "/panchangam/date?date=2026-09-23&" + TZ + "&latitude=0x10&longitude=1"],
    [endpoints.panchangamRange, "/panchangam/range?start_date=2026-09-01&end_date=2026-09-10&" + TZ + "&limit=1000"],
    [endpoints.panchangamRange, "/panchangam/range?start_date=2026-09-01&end_date=2026-09-10&" + TZ + "&page=2"],
    [endpoints.panchangamMonth, "/panchangam/month?year=2026&month=13&" + TZ],
    [endpoints.panchangamMonth, "/panchangam/month?year=26&month=1&" + TZ],
  ];
  const before = rest.hits.length;
  for (const [endpoint, path] of bad) {
    const res = await h(endpoint)(req(path, { key }));
    assert.equal(res.status, 400, path);
    assert.equal((await res.json()).error, "invalid_request");
  }
  assert.equal(rest.hits.length, before, "no Panchangam query for invalid requests");
  assert.equal(await usage(user), 0);
  const logged = await db.query("select count(*)::int as n from public.api_request_logs where user_id=$1", [user]);
  assert.equal(logged.rows[0].n, 0, "invalid requests don't even reach authorization");
});

test("dates outside the supported 2000-01-01 … 2047-07-15 dataset are rejected", async () => {
  const { key } = await apiKeyUser();
  const h = makeHandler();
  for (const date of ["1999-12-31", "2047-07-16", "2100-01-01"]) {
    const res = await h(endpoints.panchangamDate)(req(`/panchangam/date?date=${date}&${TZ}`, { key }));
    assert.equal(res.status, 400, date);
    assert.match((await res.json()).message, /2000-01-01 and 2047-07-15/);
  }
  const month = await h(endpoints.panchangamMonth)(req(`/panchangam/month?year=1999&month=12&${TZ}`, { key }));
  assert.equal(month.status, 400);
});

test("no unbounded ranges: the whole dataset in one request is refused; 31 days is the cap", async () => {
  const { key } = await apiKeyUser();
  const h = makeHandler({ maxConcurrent: 100, burstPerSecond: 100 })(endpoints.panchangamRange);

  const all = await h(req(`/panchangam/range?start_date=2000-01-01&end_date=2047-07-15&${TZ}`, { key }));
  assert.equal(all.status, 400);
  assert.match((await all.json()).message, /at most 31 days/);

  const tooLong = await h(req(`/panchangam/range?start_date=2026-01-01&end_date=2026-02-01&${TZ}`, { key }));
  assert.equal(tooLong.status, 400);

  const reversed = await h(req(`/panchangam/range?start_date=2026-02-01&end_date=2026-01-01&${TZ}`, { key }));
  assert.equal(reversed.status, 400);

  const ok = await h(req(`/panchangam/range?start_date=2026-01-01&end_date=2026-01-31&${TZ}`, { key }));
  assert.equal(ok.status, 200);
  const body = await ok.json();
  assert.equal(body.data.items.length, 31);
  assert.ok(rest.hits.some((h) => h.includes("limit=366")), "range query is bounded server-side too");
});

// 15, 16, 17, 30 ----------------------------------------------------------
test("cache: first request queries Supabase (miss), repeats are served from cache (hit) but still counted", async () => {
  repo.clearPanchangamCacheForTests();
  const { user, key } = await apiKeyUser();
  const h = makeHandler({ burstPerSecond: 100, maxConcurrent: 100 })(endpoints.panchangamDate);
  const path = `/panchangam/date?date=2033-03-03&${TZ}`;

  const before = rest.hits.filter((x) => x.includes("eq.2033-03-03")).length;
  for (let i = 0; i < 10; i++) assert.equal((await h(req(path, { key }))).status, 200);
  const queries = rest.hits.filter((x) => x.includes("eq.2033-03-03")).length - before;

  assert.equal(queries, 1, "10 requests → 1 database query");
  assert.equal(await usage(user), 10, "every request still counts toward the quota");
  const statuses = await db.query(
    "select cache_status, count(*)::int as n from public.api_request_logs where user_id=$1 group by 1 order by 1",
    [user]
  );
  assert.deepEqual(statuses.rows, [
    { cache_status: "hit", n: 9 },
    { cache_status: "miss", n: 1 },
  ]);
});

test("cache key is the date only; location is applied per response, never cross-served", async () => {
  repo.clearPanchangamCacheForTests();
  const { key } = await apiKeyUser();
  const h = makeHandler({ burstPerSecond: 100 })(endpoints.panchangamDate);
  const a = await (await h(req(`/panchangam/date?date=2034-04-04&timezone=Asia/Kolkata&latitude=17.385&longitude=78.4867`, { key }))).json();
  const b = await (await h(req(`/panchangam/date?date=2034-04-04&timezone=America/New_York`, { key }))).json();
  assert.equal(a.meta.location.timezone, "Asia/Kolkata");
  assert.equal(a.meta.location.latitude, 17.385);
  assert.equal(b.meta.location.timezone, "America/New_York");
  assert.equal(b.meta.location.latitude, null);
  assert.notEqual(a.data.location, b.data.location);
});

test("the Panchangam query selects explicit columns, never *", async () => {
  repo.clearPanchangamCacheForTests();
  await repo.fetchPanchangamByDate("2035-05-05");
  const hit = rest.hits.find((x) => x.includes("eq.2035-05-05"));
  const select = new URL(hit, "http://x").searchParams.get("select");
  assert.ok(select && select !== "*" && select.includes("tithi1_name") && !select.includes("*"));
});

test("simultaneous identical cache misses are coalesced into one database query", async () => {
  repo.clearPanchangamCacheForTests();
  rest.delayMs = 150;
  try {
    const before = rest.hits.length;
    const results = await Promise.all(Array.from({ length: 25 }, () => repo.fetchPanchangamByDate("2036-06-06")));
    assert.equal(rest.hits.length - before, 1);
    assert.ok(results.every((r) => r.day?.date === "2036-06-06"));
    assert.equal(results.filter((r) => r.cache === "miss").length, 1);
    assert.equal(results.filter((r) => r.cache === "coalesced").length, 24);
  } finally {
    rest.delayMs = 0;
  }
});

test("MemoryCache: TTL expiry, LRU bound, and errors are not cached", async () => {
  const cache = new MemoryCache(50, 2);
  let loads = 0;
  const load = async () => ++loads;
  await cache.getOrLoad("a", load);
  assert.equal((await cache.getOrLoad("a", load)).status, "hit");
  await sleep(60);
  assert.equal((await cache.getOrLoad("a", load)).status, "miss", "expired");
  await cache.getOrLoad("b", load);
  await cache.getOrLoad("c", load);
  assert.equal(cache.getStats().size, 2, "bounded");

  const flaky = new MemoryCache(10_000, 10);
  await flaky.getOrLoad("x", async () => ({ error: true }), (v) => !v.error);
  assert.equal((await flaky.getOrLoad("x", async () => ({ ok: true }), (v) => !v.error)).status, "miss");
});

// 18, 34 --------------------------------------------------------------------
test("Supabase down: clean 503 with Retry-After, and the circuit breaker stops a request storm", async () => {
  breaker.resetDatabaseCircuitForTests();
  repo.clearPanchangamCacheForTests();
  rest.mode = "fail";
  try {
    const failures = [];
    for (let i = 0; i < 8; i++) failures.push(await repo.fetchPanchangamByDate(`2040-01-0${i + 1}`));
    assert.ok(failures.every((r) => r.error?.status === 503 && r.error.code === "SUPABASE_ERROR"));
    assert.equal(breaker.isDatabaseCircuitOpen(), true);

    const hitsBefore = rest.hits.length;
    await repo.fetchPanchangamByDate("2040-02-01");
    assert.equal(rest.hits.length, hitsBefore, "open circuit: no further database calls");
  } finally {
    rest.mode = "ok";
    breaker.resetDatabaseCircuitForTests();
  }

  // Authorization store unreachable → fail closed with 503.
  const { key } = await apiKeyUser();
  store.failNext = 1;
  const res = await makeHandler()(endpoints.panchangamDate)(req(`/panchangam/date?date=2026-09-23&${TZ}`, { key }));
  assert.equal(res.status, 503);
  assert.equal((await res.json()).error, "service_unavailable");
  assert.ok(res.headers.get("retry-after"));
  breaker.resetDatabaseCircuitForTests();
});

test("without a service-role key the API fails closed (503), it never skips authorization", async () => {
  const { key } = await apiKeyUser();
  const res = await makeHandler({}, { store: null })(endpoints.panchangamDate)(
    req(`/panchangam/date?date=2026-09-23&${TZ}`, { key })
  );
  assert.equal(res.status, 503);
});

// 19 (IP) --------------------------------------------------------------------
test("one IP spraying invalid keys is throttled; other IPs and customers are unaffected", async () => {
  const h = makeHandler({ ipAuthFailuresPerMinute: 10 })(endpoints.panchangamDate);
  const path = `/panchangam/date?date=2026-09-23&${TZ}`;
  const statuses = [];
  for (let i = 0; i < 15; i++) {
    statuses.push((await h(req(path, { key: generateApiKey().secret, ip: "192.0.2.66" }))).status);
  }
  assert.equal(statuses.slice(0, 10).every((s) => s === 401), true);
  assert.equal(statuses.at(-1), 429);

  const { key } = await apiKeyUser();
  const blocked = await h(req(path, { key, ip: "192.0.2.66" }));
  assert.equal(blocked.status, 429);
  assert.equal((await blocked.json()).error, "too_many_requests");
  assert.equal((await h(req(path, { key, ip: "192.0.2.67" }))).status, 200);
});

// 20 ------------------------------------------------------------------------
test("key sharing: many networks at once is flagged and limits tightened — not banned", async () => {
  const { user, key } = await apiKeyUser();
  const h = makeHandler({ burstPerSecond: 100, ratePerMinute: 1000, maxConcurrent: 100, anomalyDistinctIps: 20 })(
    endpoints.panchangamDate
  );
  const path = `/panchangam/date?date=2026-09-23&${TZ}`;

  // A couple of IP changes (mobile network, VPN) are normal: nothing happens.
  for (const ip of ["100.64.0.1", "100.64.0.2", "100.64.0.3"]) assert.equal((await h(req(path, { key, ip }))).status, 200);

  for (let i = 0; i < 25; i++) {
    await h(req(path, { key, ip: `100.65.${i}.1`, headers: { "x-vercel-ip-country": ["IN", "US", "DE", "SG", "BR"][i % 5] } }));
  }
  // The check runs at most once a minute per key; simulate that minute passing.
  await db.query("update public.api_key_state set last_anomaly_check = null");
  // The check runs when this request finishes; tightening applies from the next one.
  assert.equal((await h(req(path, { key, ip: "100.66.0.1" }))).status, 200);
  const res = await h(req(path, { key, ip: "100.66.0.2" }));
  assert.equal(res.status, 200, "still served");
  assert.equal(res.headers.get("x-ratelimit-limit"), "500", "limits halved while tightened");

  const events = await db.query("select kind, details from public.api_key_events where user_id=$1", [user]);
  assert.equal(events.rows.length, 1);
  assert.equal(events.rows[0].kind, "suspicious_ip_spread");
  assert.ok(events.rows[0].details.distinct_ips > 20);

  const stillActive = await db.query("select revoked_at from public.api_keys where user_id=$1", [user]);
  assert.equal(stillActive.rows[0].revoked_at, null, "no automatic revocation");
});

// 23 ------------------------------------------------------------------------
test("direct Supabase access: anon and signed-in users can't read Panchangam data or other customers' API rows", async () => {
  const { user: alice } = await apiKeyUser();
  const { user: bob } = await apiKeyUser();
  await makeHandler()(endpoints.panchangamDate)(req(`/panchangam/date?date=2026-09-23&${TZ}`, { key: secrets.at(-1) }));

  for (const role of ["anon", "authenticated"]) {
    await assert.rejects(
      asRole(db, role, role === "authenticated" ? alice : null, (tx) => tx.query("select * from public.daily_panchangam limit 1")),
      /permission denied/,
      `${role} must not read daily_panchangam`
    );
  }
  for (const table of ["api_key_state", "api_inflight"]) {
    await assert.rejects(asRole(db, "authenticated", alice, (tx) => tx.query(`select * from public.${table}`)), /permission denied/);
  }
  await assert.rejects(
    asRole(db, "authenticated", alice, (tx) => tx.query("select key_hash from public.api_keys")),
    /permission denied/,
    "key hashes are never readable by users"
  );
  await assert.rejects(
    asRole(db, "authenticated", alice, (tx) => tx.query("select public.api_authorize('x', gen_random_uuid(), 1,1,1,1,1,'{}')")),
    /permission denied/
  );
  await assert.rejects(
    asRole(db, "authenticated", alice, (tx) => tx.query("insert into public.api_keys (user_id,name,key_prefix,key_hash) values ($1,'x','sk_live_xxxxxx',repeat('a',64))", [alice])),
    /permission denied/
  );
  await assert.rejects(
    asRole(db, "authenticated", alice, (tx) => tx.query("update public.api_usage_periods set used = 0")),
    /permission denied/
  );

  const own = await asRole(db, "authenticated", alice, (tx) => tx.query("select user_id from public.api_keys"));
  assert.ok(own.rows.length > 0 && own.rows.every((r) => r.user_id === alice));
  const logsSeen = await asRole(db, "authenticated", bob, (tx) => tx.query("select user_id from public.api_request_logs"));
  assert.ok(logsSeen.rows.every((r) => r.user_id === bob));
  await assert.rejects(
    asRole(db, "anon", null, (tx) => tx.query("select * from public.api_admin_hourly")),
    /permission denied/
  );
});

test("retention: api_prune removes detailed logs past the window and keeps usage totals", async () => {
  const { user, key } = await apiKeyUser();
  await makeHandler()(endpoints.panchangamDate)(req(`/panchangam/date?date=2026-09-23&${TZ}`, { key }));
  await db.query("update public.api_request_logs set created_at = now() - interval '100 days' where user_id=$1", [user]);
  const pruned = await db.query("select public.api_prune(90) as n");
  assert.ok(pruned.rows[0].n >= 1);
  const left = await db.query("select count(*)::int as n from public.api_request_logs where user_id=$1", [user]);
  assert.equal(left.rows[0].n, 0);
  assert.equal(await usage(user), 1, "aggregated usage survives pruning");

  const hourly = await db.query("select requests, cache_hit_rate_pct from public.api_admin_hourly limit 1");
  assert.ok(hourly.rows.length === 1);
});

// 21 ------------------------------------------------------------------------
test("API keys never appear in logs (application or database)", async () => {
  assert.ok(logs.length > 50 && secrets.length > 20);
  const appLogs = logs.join("\n");
  const dbLogs = JSON.stringify((await db.query("select * from public.api_request_logs")).rows);
  for (const secret of secrets) {
    assert.ok(!appLogs.includes(secret), "application log leaked a key");
    assert.ok(!dbLogs.includes(secret), "database log leaked a key");
    assert.ok(!appLogs.includes(secret.slice(14)), "application log leaked the secret part of a key");
  }
  assert.ok(!appLogs.includes("192.0.2.66"), "raw IPs are hashed");
  assert.ok(!appLogs.includes(process.env.SUPABASE_SECRET_KEY));
});
