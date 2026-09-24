// Small in-process TTL cache with request coalescing, used in front of
// Supabase for Panchangam data (which is precomputed and changes only when the
// dataset is reloaded).
//
// On serverless hosts each warm instance has its own copy, so this is a
// per-instance cache: it absorbs repeated and concurrent reads for the same
// dates without a network hop. It is deliberately not the source of truth for
// anything (limits and quota live in Postgres).

export type CacheStatus = "hit" | "miss" | "coalesced";

export interface CacheStats {
  hits: number;
  misses: number;
  coalesced: number;
  size: number;
}

interface Entry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache<T> {
  private entries = new Map<string, Entry<T>>();
  private inflight = new Map<string, Promise<T>>();
  private stats = { hits: 0, misses: 0, coalesced: 0 };
  private ttlMs: number;
  private maxEntries: number;

  constructor(ttlMs: number, maxEntries: number) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
  }

  get(key: string, now = Date.now()): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= now) {
      this.entries.delete(key);
      return undefined;
    }
    // Refresh recency so the Map's insertion order approximates LRU.
    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T, now = Date.now()) {
    if (this.ttlMs <= 0) return;
    this.entries.delete(key);
    this.entries.set(key, { value, expiresAt: now + this.ttlMs });
    while (this.entries.size > this.maxEntries) {
      const oldest = this.entries.keys().next().value;
      if (oldest === undefined) break;
      this.entries.delete(oldest);
    }
  }

  /**
   * Returns the cached value, or runs `load` once for all concurrent callers
   * asking for the same key. `shouldCache` decides whether a loaded value is
   * stored (errors are never cached, so an outage is not remembered).
   */
  async getOrLoad(
    key: string,
    load: () => Promise<T>,
    shouldCache: (value: T) => boolean = () => true
  ): Promise<{ value: T; status: CacheStatus }> {
    const cached = this.get(key);
    if (cached !== undefined) {
      this.stats.hits++;
      return { value: cached, status: "hit" };
    }

    const pending = this.inflight.get(key);
    if (pending) {
      this.stats.coalesced++;
      return { value: await pending, status: "coalesced" };
    }

    this.stats.misses++;
    const promise = load().then((value) => {
      if (shouldCache(value)) this.set(key, value);
      return value;
    });
    this.inflight.set(key, promise);
    try {
      return { value: await promise, status: "miss" };
    } finally {
      this.inflight.delete(key);
    }
  }

  getStats(): CacheStats {
    return { ...this.stats, size: this.entries.size };
  }

  clear() {
    this.entries.clear();
    this.inflight.clear();
    this.stats = { hits: 0, misses: 0, coalesced: 0 };
  }
}
