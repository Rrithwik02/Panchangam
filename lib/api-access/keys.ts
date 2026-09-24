import { createHash, randomBytes } from "node:crypto";

// API keys are 256-bit random secrets: sk_live_<43 base64url chars>. Only a
// SHA-256 hash is stored. A slow password hash (bcrypt/argon2) buys nothing
// for secrets this long — they can't be brute-forced — and SHA-256 lets the
// database find the key through a unique index in one lookup.

const KEY_PATTERN = /^sk_(live|test)_[A-Za-z0-9_-]{43}$/;
const PREFIX_LENGTH = 14; // "sk_live_" + 6 characters, safe to display

export interface GeneratedApiKey {
  /** Shown to the customer exactly once; never stored or logged. */
  secret: string;
  prefix: string;
  hash: string;
}

export function generateApiKey(environment: "live" | "test" = "live"): GeneratedApiKey {
  const secret = `sk_${environment}_${randomBytes(32).toString("base64url")}`;
  return { secret, prefix: secret.slice(0, PREFIX_LENGTH), hash: hashApiKey(secret) };
}

export function hashApiKey(secret: string) {
  return createHash("sha256").update(secret, "utf8").digest("hex");
}

export function isWellFormedApiKey(value: string) {
  return KEY_PATTERN.test(value);
}

export type BearerResult =
  | { kind: "missing" }
  | { kind: "malformed" }
  | { kind: "ok"; secret: string };

/** Reads `Authorization: Bearer <key>`. Keys are never accepted from the URL. */
export function extractBearerKey(headers: Headers): BearerResult {
  const header = headers.get("authorization");
  if (!header) return { kind: "missing" };

  const match = /^Bearer\s+(\S+)\s*$/i.exec(header);
  if (!match || !isWellFormedApiKey(match[1])) return { kind: "malformed" };
  return { kind: "ok", secret: match[1] };
}
