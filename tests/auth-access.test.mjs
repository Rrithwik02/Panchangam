// HTTP-level checks for route protection and Free/Pro access control, as seen
// by a signed-out visitor (no Supabase session cookie). Requires a prior build.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { test, before, after } from "node:test";
import path from "node:path";

const port = 3125; // 3123/3124 are used by api-contract.test.mjs
const baseUrl = `http://127.0.0.1:${port}`;
const nextBin = path.resolve(process.cwd(), "node_modules", "next", "dist", "bin", "next");
// Asia/Kolkata: yesterday 2026-08-13, today 2026-08-14, tomorrow 2026-08-15.
const testNow = "2026-08-13T20:30:00Z";
const tz = "timezone=Asia/Kolkata";

let serverProcess;

before(async () => {
  serverProcess = spawn(process.execPath, [nextBin, "start", "-p", String(port)], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      PORT: String(port),
      PANCHANGAM_TEST_NOW: testNow,
      BILLING_PROVIDER: "",
      RAZORPAY_WEBHOOK_SECRET: "test_webhook_secret",
    },
  });

  await new Promise((resolve, reject) => {
    let buffer = "";
    const onData = (chunk) => {
      buffer += chunk.toString();
      if (/ready/i.test(buffer)) resolve();
    };
    serverProcess.stdout.on("data", onData);
    serverProcess.stderr.on("data", onData);
    serverProcess.once("exit", (code) => reject(new Error(`next start exited with ${code}`)));
  });
});

after(() => {
  if (serverProcess && !serverProcess.killed) serverProcess.kill();
});

const get = (pathname, init) => fetch(`${baseUrl}${pathname}`, { redirect: "manual", ...init });

test("signed-out visitors are redirected from every /account page to /login", async () => {
  for (const pathname of ["/account", "/account/profile", "/account/subscription", "/account/billing", "/account/security"]) {
    const res = await get(pathname);
    assert.equal(res.status, 307, pathname);
    const location = new URL(res.headers.get("location"), baseUrl);
    assert.equal(location.pathname, "/login", pathname);
    assert.equal(location.searchParams.get("next"), pathname);
  }
});

test("login, signup, forgot-password, upgrade and explore pages render", async () => {
  for (const pathname of ["/login", "/signup", "/forgot-password", "/upgrade", "/explore", "/"]) {
    const res = await get(pathname);
    assert.equal(res.status, 200, pathname);
  }
});

test("reset-password without a recovery session shows the expired-link state", async () => {
  const res = await get("/reset-password");
  assert.equal(res.status, 200);
  assert.match(await res.text(), /invalid or has expired/);
});

test("auth callback without a code redirects back to login with an error", async () => {
  const res = await get("/auth/callback?next=/account");
  assert.equal(res.status, 307);
  assert.match(res.headers.get("location"), /\/login\?error=link_invalid/);
});

test("auth callback never redirects off-site via ?next=", async () => {
  const res = await get("/auth/callback?next=//evil.example");
  const location = new URL(res.headers.get("location"), baseUrl);
  assert.notEqual(location.hostname, "evil.example");
  assert.equal(location.port, String(port));
  assert.equal(location.pathname, "/login");
});

test("/api/me reports a signed-out Free viewer", async () => {
  const res = await get("/api/me");
  const body = await res.json();
  assert.deepEqual({ signedIn: body.signedIn, plan: body.plan }, { signedIn: false, plan: "free" });
  assert.match(res.headers.get("cache-control"), /no-store/);
});

test("explore page shows a sign-in prompt instead of the explorer when signed out", async () => {
  const res = await get("/explore?date=2012-05-20");
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /Log in to explore 50 years of Panchangam/);
  assert.match(html, /\/login\?next=%2Fexplore%3Fdate%3D2012-05-20/);
  assert.doesNotMatch(html, /id="explore-date"/);
});

test("signed out: the explorer data endpoint refuses every date, even Today", async () => {
  // Yesterday, Today, Tomorrow, a historical date and an out-of-range date.
  for (const date of ["2026-08-13", "2026-08-14", "2026-08-15", "2012-05-20", "1999-12-31"]) {
    const res = await get(`/api/web/panchangam/date?date=${date}&${tz}`);
    const body = await res.json();
    assert.equal(res.status, 401, date);
    assert.equal(body.error.code, "UNAUTHENTICATED", date);
    assert.equal(body.data, undefined, date);
  }
});

test("signed out: home page Tomorrow is still the existing preview", async () => {
  const res = await get(`/api/web/panchangam/tomorrow?${tz}`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.meta.access, "preview");
  assert.equal(body.data.yogas, undefined);
  assert.equal(body.data.sunrise, undefined);
});

test("access can't be faked with query params, headers or cookies", async () => {
  const res = await get(`/api/web/panchangam/date?date=2012-05-20&${tz}&plan=pro&isPro=true`, {
    headers: { cookie: "plan=pro; isPro=true; sb-access-token=fake", "x-plan": "pro" },
  });
  assert.equal(res.status, 401);
});

test("invalid dates are rejected", async () => {
  const bad = await get(`/api/web/panchangam/date?date=2026-13-40&${tz}`);
  assert.equal(bad.status, 400);
});

test("billing endpoints require a signed-in user", async () => {
  for (const pathname of ["/api/billing/checkout", "/api/billing/mock-confirm", "/api/billing/cancel"]) {
    const res = await get(pathname, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    assert.equal(res.status, 401, pathname);
  }
});

test("billing endpoints reject cross-origin requests", async () => {
  const res = await get("/api/billing/checkout", { method: "POST", headers: { origin: "https://evil.example" } });
  assert.equal(res.status, 403);
});

test("Razorpay webhook rejects unsigned or wrongly signed events", async () => {
  const payload = JSON.stringify({ event: "subscription.activated", payload: {} });
  const unsigned = await get("/api/webhooks/razorpay", { method: "POST", body: payload });
  assert.equal(unsigned.status, 401);

  const forged = await get("/api/webhooks/razorpay", {
    method: "POST",
    body: payload,
    headers: { "x-razorpay-signature": "deadbeef" },
  });
  assert.equal(forged.status, 401);
});

test("Razorpay webhook accepts a correctly signed event", async () => {
  const { createHmac } = await import("node:crypto");
  // Unknown event types are acknowledged without touching the database.
  const payload = JSON.stringify({ event: "order.paid", payload: {} });
  const signature = createHmac("sha256", "test_webhook_secret").update(payload).digest("hex");
  const res = await get("/api/webhooks/razorpay", {
    method: "POST",
    body: payload,
    headers: { "x-razorpay-signature": signature },
  });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, handled: false });
});

test("existing public v1 API is unchanged", async () => {
  const tomorrow = await (await get(`/api/v1/panchangam/tomorrow?${tz}`)).json();
  assert.equal(tomorrow.meta.access, "preview");
  const past = await get(`/api/v1/panchangam/date?date=2012-05-20&${tz}`);
  assert.notEqual(past.status, 403);
});
