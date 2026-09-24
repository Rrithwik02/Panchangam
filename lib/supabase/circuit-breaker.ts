// Stops a database outage from turning into a request storm: after a run of
// consecutive failures, callers fail fast (503) for a cool-down period instead
// of each waiting on — and piling more load onto — an unhealthy database.
// Per instance, no retries: a single probe is let through after the cool-down.

const FAILURE_THRESHOLD = 5;
const COOL_DOWN_MS = 15_000;

let consecutiveFailures = 0;
let openUntil = 0;

export function isDatabaseCircuitOpen(now = Date.now()) {
  return openUntil > now;
}

export function databaseCircuitRetryAfterSeconds(now = Date.now()) {
  return Math.max(1, Math.ceil((openUntil - now) / 1000));
}

export function recordDatabaseSuccess() {
  consecutiveFailures = 0;
  openUntil = 0;
}

export function recordDatabaseFailure(now = Date.now()) {
  consecutiveFailures++;
  if (consecutiveFailures >= FAILURE_THRESHOLD) {
    openUntil = now + COOL_DOWN_MS;
    consecutiveFailures = 0;
  }
}

export function resetDatabaseCircuitForTests() {
  consecutiveFailures = 0;
  openUntil = 0;
}
