import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { test, before, after } from "node:test";
import path from "node:path";
import { readFileSync, readdirSync, existsSync } from "node:fs";

const port = 3123;
const baseUrl = `http://127.0.0.1:${port}`;
const nextBin = path.resolve(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const testNow = "2026-08-13T20:30:00Z";

let serverProcess;

function waitForReady(proc) {
  return new Promise((resolve, reject) => {
    let buffer = "";

    const onData = (chunk) => {
      buffer += chunk.toString();
      if (/ready/i.test(buffer)) {
        cleanup();
        resolve();
      }
    };

    const onExit = (code) => {
      cleanup();
      reject(new Error(`Next start exited early with code ${code}`));
    };

    const onError = (error) => {
      cleanup();
      reject(error);
    };

    function cleanup() {
      proc.stdout.off("data", onData);
      proc.stderr.off("data", onData);
      proc.off("exit", onExit);
      proc.off("error", onError);
    }

    proc.stdout.on("data", onData);
    proc.stderr.on("data", onData);
    proc.once("exit", onExit);
    proc.once("error", onError);
  });
}

const serverOutput = [];

function spawnServer(portNumber, envOverrides = {}) {
  const proc = spawn(process.execPath, [nextBin, "start", "-p", String(portNumber)], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
    env: {
      ...process.env,
      PORT: String(portNumber),
      PANCHANGAM_TEST_NOW: testNow,
      SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_URL: "",
      ...envOverrides,
    },
  });

  proc.stdout.on("data", (chunk) => serverOutput.push(chunk.toString()));
  proc.stderr.on("data", (chunk) => serverOutput.push(chunk.toString()));
  return proc;
}

async function startServer(portNumber, envOverrides = {}) {
  const proc = spawnServer(portNumber, envOverrides);
  await waitForReady(proc);
  return proc;
}

function stopServer(proc) {
  if (proc && !proc.killed) {
    proc.kill();
  }
}

before(async () => {
  serverProcess = await startServer(port);
});

after(() => {
  stopServer(serverProcess);
});

async function request(pathname, base = baseUrl, init) {
  const response = await fetch(`${base}${pathname}`, init);
  const body = await response.json();
  return { response, body };
}

// ---------------------------------------------------------------------------
// Website endpoints (public Today/Yesterday, session-aware Tomorrow)
// ---------------------------------------------------------------------------
test("today uses the user's timezone and returns a full response", async () => {
  const { response, body } = await request("/api/web/panchangam/today?timezone=Asia/Kolkata");

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.meta.access, "full");
  assert.equal(body.meta.location.timezone, "Asia/Kolkata");
  assert.equal(body.data.date, "2026-08-14");
  assert.equal(body.data.dateLabel, "14 August 2026");
  assert.equal(body.data.vara, "Friday");
});

test("yesterday uses the user's timezone and returns a full response", async () => {
  const { response, body } = await request("/api/web/panchangam/yesterday?timezone=Asia/Kolkata");

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.meta.access, "full");
  assert.equal(body.data.date, "2026-08-13");
  assert.equal(body.data.dateLabel, "13 August 2026");
  assert.equal(body.data.vara, "Thursday");
});

test("tomorrow returns a preview payload only for signed-out visitors", async () => {
  const { response, body } = await request("/api/web/panchangam/tomorrow?timezone=Asia/Kolkata");

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.meta.access, "preview");
  assert.equal(body.data.access, "preview");
  assert.equal(body.data.date, "2026-08-15");
  assert.equal(body.data.vara, "Saturday");
  assert.equal(body.data.sunrise, undefined);
});

test("invalid timezone is rejected", async () => {
  const { response, body } = await request("/api/web/panchangam/today?timezone=Not_A_Zone");
  assert.equal(response.status, 400);
  assert.equal(body.error.code, "INVALID_TIMEZONE");
});

test("invalid latitude is rejected", async () => {
  const { response, body } = await request(
    "/api/web/panchangam/today?latitude=999&longitude=78.4867&timezone=Asia/Kolkata"
  );
  assert.equal(response.status, 400);
  assert.equal(body.error.code, "INVALID_LATITUDE");
});

test("missing timezone is rejected", async () => {
  const { response, body } = await request("/api/web/panchangam/today");
  assert.equal(response.status, 400);
  assert.equal(body.error.code, "INVALID_TIMEZONE");
});

test("supabase connection failures return a clean HTTP 503", async () => {
  const errorPort = 3124;
  const errorBaseUrl = `http://127.0.0.1:${errorPort}`;
  const errorServer = await startServer(errorPort, {
    SUPABASE_URL: "http://127.0.0.1:59999",
    SUPABASE_SERVICE_ROLE_KEY: "test-key",
  });

  try {
    const { response, body } = await request("/api/web/panchangam/today?timezone=Asia/Kolkata", errorBaseUrl);
    assert.equal(response.status, 503);
    assert.equal(body.success, false);
    assert.equal(body.error.code, "SUPABASE_ERROR");
  } finally {
    stopServer(errorServer);
  }
});

test("openapi route documents bearer auth and only the supported endpoints", async () => {
  const { response, body } = await request("/api/openapi");

  assert.equal(response.status, 200);
  assert.equal(body.openapi, "3.1.0");
  assert.equal(body.components.securitySchemes.bearerAuth.scheme, "bearer");
  assert.ok(body.paths["/panchangam/date"]);
  assert.equal(body.paths["/tithis/search"], undefined);
});

// ---------------------------------------------------------------------------
// Paid API over real HTTP (no service-role key in this server: fail closed)
// ---------------------------------------------------------------------------
const fakeKey = "sk_test_" + "A".repeat(43);

test("v1 API requires an API key", async () => {
  const { response, body } = await request("/api/v1/panchangam/date?date=2026-08-19&timezone=Asia/Kolkata");
  assert.equal(response.status, 401);
  assert.deepEqual(Object.keys(body).sort(), ["error", "message", "success"]);
  assert.equal(body.error, "missing_api_key");
  assert.match(response.headers.get("www-authenticate") ?? "", /^Bearer/);
  assert.equal(response.headers.get("cache-control"), "private, no-store");

  for (const path of ["today", "yesterday", "tomorrow"]) {
    const res = await request(`/api/v1/panchangam/${path}?timezone=Asia/Kolkata`);
    assert.equal(res.response.status, 401, path);
  }
});

test("v1 API rejects malformed keys and keys in the URL", async () => {
  const malformed = await request("/api/v1/panchangam/date?date=2026-08-19&timezone=Asia/Kolkata", baseUrl, {
    headers: { authorization: "Bearer nope" },
  });
  assert.equal(malformed.response.status, 401);
  assert.equal(malformed.body.error, "invalid_api_key");

  const inUrl = await request(`/api/v1/panchangam/date?date=2026-08-19&timezone=Asia/Kolkata&api_key=${fakeKey}`);
  assert.equal(inUrl.response.status, 400);
  assert.ok(!JSON.stringify(inUrl.body).includes(fakeKey));
});

test("v1 API fails closed (503) when authorization can't be checked", async () => {
  const { response, body } = await request("/api/v1/panchangam/date?date=2026-08-19&timezone=Asia/Kolkata", baseUrl, {
    headers: { authorization: `Bearer ${fakeKey}` },
  });
  assert.equal(response.status, 503);
  assert.equal(body.error, "service_unavailable");
  assert.equal(body.data, undefined);
});

test("unsupported and retired endpoints return a JSON 404 without touching data", async () => {
  for (const path of ["/api/v1/tithis/search?name=x", "/api/v1/calendar/year?year=2026", "/api/v1/sql?q=select", "/api/v1/panchangam/export"]) {
    const { response, body } = await request(path);
    assert.equal(response.status, 404, path);
    assert.equal(body.error, "unsupported_endpoint");
  }
});

test("v1 endpoints only accept GET", async () => {
  const response = await fetch(`${baseUrl}/api/v1/panchangam/date?date=2026-08-19&timezone=Asia/Kolkata`, {
    method: "POST",
    headers: { authorization: `Bearer ${fakeKey}` },
  });
  assert.equal(response.status, 405);
});

test("API keys never appear in server logs", async () => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const output = serverOutput.join("");
  assert.ok(output.includes('"type":"api_request"'), "structured API logs are written");
  assert.ok(!output.includes(fakeKey), "the raw key must never be logged");
  assert.ok(!output.includes("A".repeat(43)));
});

test("the service-role key and server-only code never reach the browser bundle", () => {
  const envFile = path.resolve(process.cwd(), ".env.local");
  const secrets = [];
  if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
      const match = /^(SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|API_IP_HASH_SALT)=(.+)$/.exec(line.trim());
      if (match && match[2].length > 8) secrets.push(match[2].replace(/^["']|["']$/g, ""));
    }
  }

  const staticDir = path.resolve(process.cwd(), ".next", "static");
  const files = readdirSync(staticDir, { recursive: true }).filter((f) => String(f).endsWith(".js"));
  assert.ok(files.length > 0);
  for (const file of files) {
    const js = readFileSync(path.join(staticDir, String(file)), "utf8");
    for (const secret of secrets) assert.ok(!js.includes(secret), `secret found in ${file}`);
    assert.ok(!js.includes("SUPABASE_SECRET_KEY") && !js.includes("SUPABASE_SERVICE_ROLE_KEY"), file);
    assert.ok(!js.includes("api_authorize"), `server-only API code in ${file}`);
  }
});
