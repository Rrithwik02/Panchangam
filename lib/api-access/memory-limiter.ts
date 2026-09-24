// Per-instance, in-memory counters used as a cheap first line of defence in
// front of the database: they shed obvious floods (one IP hammering, a key
// that was just told to back off, garbage keys) before any query is made.
//
// They are NOT the customer's rate limit or quota — those are enforced in
// Postgres, which every serverless instance shares. On a single instance they
// can only ever be stricter than, never looser than, the shared limits.

const MAX_TRACKED = 50_000;

function trim<K, V>(map: Map<K, V>) {
  while (map.size > MAX_TRACKED) {
    const oldest = map.keys().next().value;
    if (oldest === undefined) break;
    map.delete(oldest);
  }
}

/** Fixed-window counter: at most `limit` hits per `windowMs` per key. */
export class WindowCounter {
  private windows = new Map<string, { start: number; count: number }>();
  private limit: number;
  private windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  /** Records a hit; returns seconds to wait if the limit is exceeded, else 0. */
  hit(key: string, now = Date.now()): number {
    const start = now - (now % this.windowMs);
    const current = this.windows.get(key);
    if (!current || current.start !== start) {
      this.windows.delete(key);
      this.windows.set(key, { start, count: 1 });
      trim(this.windows);
      return 0;
    }
    current.count++;
    if (current.count > this.limit) {
      return Math.max(1, Math.ceil((start + this.windowMs - now) / 1000));
    }
    return 0;
  }

  clear() {
    this.windows.clear();
  }
}

/** Remembers "blocked until" per key, e.g. after a 429 from the database. */
export class BlockList<T = string> {
  private blocked = new Map<string, { until: number; reason: T }>();

  block(key: string, seconds: number, reason: T, now = Date.now()) {
    this.blocked.delete(key);
    this.blocked.set(key, { until: now + seconds * 1000, reason });
    trim(this.blocked);
  }

  check(key: string, now = Date.now()): { retryAfter: number; reason: T } | null {
    const entry = this.blocked.get(key);
    if (!entry) return null;
    if (entry.until <= now) {
      this.blocked.delete(key);
      return null;
    }
    return { retryAfter: Math.max(1, Math.ceil((entry.until - now) / 1000)), reason: entry.reason };
  }

  clear() {
    this.blocked.clear();
  }
}
