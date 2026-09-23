// Run with: node --experimental-strip-types --test tests/pro-access.test.mjs
import assert from "node:assert/strict";
import { test } from "node:test";
import { hasProAccess } from "../lib/billing/access-rules.ts";

const now = new Date("2026-09-23T12:00:00Z");
const future = "2026-10-23T12:00:00Z";
const past = "2026-09-01T12:00:00Z";

test("no subscription or free plan never has Pro", () => {
  assert.equal(hasProAccess(null, now), false);
  assert.equal(hasProAccess({ plan: "free", status: "active", current_period_end: null }, now), false);
  assert.equal(hasProAccess({ plan: "free", status: "active", current_period_end: future }, now), false);
});

test("active Pro inside its paid period has Pro", () => {
  assert.equal(hasProAccess({ plan: "pro", status: "active", current_period_end: future }, now), true);
});

test("active Pro past its period end (no renewal received) is treated as expired", () => {
  assert.equal(hasProAccess({ plan: "pro", status: "active", current_period_end: past }, now), false);
});

test("cancelled Pro keeps access until the period ends, then loses it", () => {
  assert.equal(hasProAccess({ plan: "pro", status: "cancelled", current_period_end: future }, now), true);
  assert.equal(hasProAccess({ plan: "pro", status: "cancelled", current_period_end: past }, now), false);
  assert.equal(hasProAccess({ plan: "pro", status: "cancelled", current_period_end: null }, now), false);
});

test("expired and payment_failed never have Pro", () => {
  assert.equal(hasProAccess({ plan: "pro", status: "expired", current_period_end: future }, now), false);
  assert.equal(hasProAccess({ plan: "pro", status: "payment_failed", current_period_end: future }, now), false);
});
