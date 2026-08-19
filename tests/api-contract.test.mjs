import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { test, before, after } from "node:test";
import path from "node:path";

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

function spawnServer(portNumber, envOverrides = {}) {
  const proc = spawn(process.execPath, [nextBin, "start", "-p", String(portNumber)], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
    env: {
      ...process.env,
      PORT: String(portNumber),
      PANCHANGAM_TEST_NOW: testNow,
      ...envOverrides,
    },
  });

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

async function request(pathname, base = baseUrl) {
  const response = await fetch(`${base}${pathname}`);
  const body = await response.json();
  return { response, body };
}

test("today uses the user's timezone and returns a full response", async () => {
  const { response, body } = await request(
    "/api/v1/panchangam/today?timezone=Asia/Kolkata"
  );

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.meta.access, "full");
  assert.equal(body.meta.location.timezone, "Asia/Kolkata");
  assert.equal(body.data.date, "2026-08-14");
  assert.equal(body.data.dateLabel, "14 August 2026");
  assert.equal(body.data.sunrise, "05:58 AM");
});

test("yesterday uses the user's timezone and returns a full response", async () => {
  const { response, body } = await request(
    "/api/v1/panchangam/yesterday?timezone=Asia/Kolkata"
  );

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.meta.access, "full");
  assert.equal(body.data.date, "2026-08-13");
});

test("tomorrow returns a preview payload only", async () => {
  const { response, body } = await request(
    "/api/v1/panchangam/tomorrow?timezone=Asia/Kolkata"
  );

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.meta.access, "preview");
  assert.deepEqual(body.meta.preview_fields, ["Date", "Vara", "Paksha", "Tithi", "Nakshatra"]);
  assert.equal(body.data.access, "preview");
  assert.equal(body.data.date, "2026-08-15");
  assert.equal(body.data.dateLabel, "15 August 2026");
  assert.equal(body.data.tithi, "Shukla Saptami");
  assert.equal(body.data.upgradeMessage, "Full future-date access is available with Premium.");
  assert.equal(body.data.sunrise, undefined);
});

test("invalid timezone is rejected", async () => {
  const { response, body } = await request(
    "/api/v1/panchangam/date?date=2026-08-13&timezone=Not_A_Zone"
  );

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "INVALID_TIMEZONE");
});

test("invalid latitude is rejected", async () => {
  const { response, body } = await request(
    "/api/v1/panchangam/date?date=2026-08-13&latitude=999&longitude=78.4867&timezone=Asia/Kolkata"
  );

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "INVALID_LATITUDE");
});

test("missing timezone is rejected for the free relative-date endpoints", async () => {
  const { response, body } = await request("/api/v1/panchangam/today");

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "INVALID_TIMEZONE");
});

test("date endpoint returns the requested day", async () => {
  const { response, body } = await request(
    "/api/v1/panchangam/date?date=2026-08-13&timezone=Asia/Kolkata"
  );

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.meta.access, "full");
  assert.equal(body.data.date, "2026-08-13");
});

test("range endpoint returns the available reference day when in range", async () => {
  const { response, body } = await request(
    "/api/v1/panchangam/range?start_date=2026-08-01&end_date=2026-08-31&timezone=Asia/Kolkata"
  );

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.total_records, 1);
  assert.equal(body.data.items[0].date, "2026-08-13");
});

test("supabase errors are surfaced as a clean API error", async () => {
  const errorPort = 3124;
  const errorBaseUrl = `http://127.0.0.1:${errorPort}`;
  const errorServer = await startServer(errorPort, {
    SUPABASE_URL: "http://127.0.0.1:59999",
    SUPABASE_SERVICE_ROLE_KEY: "test-key",
  });

  try {
    const { response, body } = await request(
      "/api/v1/panchangam/today?timezone=Asia/Kolkata",
      errorBaseUrl
    );

    assert.equal(response.status, 502);
    assert.equal(body.success, false);
    assert.equal(body.error.code, "SUPABASE_ERROR");
  } finally {
    stopServer(errorServer);
  }
});

test("openapi route returns a spec document", async () => {
  const { response, body } = await request("/api/openapi");

  assert.equal(response.status, 200);
  assert.equal(body.openapi, "3.1.0");
  assert.ok(body.paths["/panchangam/date"]);
});
