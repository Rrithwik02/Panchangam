import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { test, before, after } from "node:test";
import path from "node:path";

const port = 3123;
const baseUrl = `http://127.0.0.1:${port}`;
const nextBin = path.resolve(process.cwd(), "node_modules", "next", "dist", "bin", "next");

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

before(async () => {
  serverProcess = spawn(process.execPath, [nextBin, "start", "-p", String(port)], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
    env: {
      ...process.env,
      PORT: String(port),
    },
  });

  await waitForReady(serverProcess);
});

after(() => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
});

async function request(pathname) {
  const response = await fetch(`${baseUrl}${pathname}`);
  const body = await response.json();
  return { response, body };
}

test("panchangam date returns success response with location metadata", async () => {
  const { response, body } = await request(
    "/api/v1/panchangam/date?date=2026-08-13&timezone=Asia/Kolkata"
  );

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.meta.calculation_source, "precomputed");
  assert.equal(body.meta.location.timezone, "Asia/Kolkata");
  assert.equal(body.data.date, "2026-08-13");
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

test("range endpoint returns the available reference day when in range", async () => {
  const { response, body } = await request(
    "/api/v1/panchangam/range?start_date=2026-08-01&end_date=2026-08-31&timezone=Asia/Kolkata"
  );

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.total_records, 1);
  assert.equal(body.data.items[0].date, "2026-08-13");
});

test("tithi search can return an empty result set", async () => {
  const { response, body } = await request(
    "/api/v1/tithis/search?name=Ekadashi&timezone=Asia/Kolkata"
  );

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.total_records, 0);
});

test("openapi route returns a spec document", async () => {
  const { response, body } = await request("/api/openapi");

  assert.equal(response.status, 200);
  assert.equal(body.openapi, "3.1.0");
  assert.ok(body.paths["/panchangam/date"]);
});
