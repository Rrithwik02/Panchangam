import "server-only";

import { getSupabaseAdminClient, isSupabaseUrlConfigured } from "@/lib/supabase/admin";
import {
  isDatabaseCircuitOpen,
  recordDatabaseFailure,
  recordDatabaseSuccess,
} from "@/lib/supabase/circuit-breaker";
import { MemoryCache, type CacheStatus } from "@/lib/cache/memory-cache";
import { getApiConfig } from "@/lib/api-access/config";
import { todaysPanchangam } from "@/lib/mock-panchangam";
import { formatDateLabel, getWeekdayNameForDate } from "@/lib/api/panchangam";
import type { PanchangamDay, PanchangamPeriodEntry, TimingRange } from "@/lib/types/panchangam";

type SupabaseRow = Record<string, unknown>;

export type PanchangamDataSource = "supabase" | "reference";

export interface PanchangamRecordResult {
  day: PanchangamDay;
  source: PanchangamDataSource;
}

export interface PanchangamRepositoryError {
  code: "DATA_NOT_FOUND" | "SUPABASE_ERROR";
  message: string;
  status: number;
}

export interface PanchangamDateLookupResult {
  day?: PanchangamDay;
  source?: PanchangamDataSource;
  error?: PanchangamRepositoryError;
  /** How the server-side cache answered; "none" when no cache was involved. */
  cache?: CacheStatus | "none";
}

export interface PanchangamRangeLookupResult {
  items?: PanchangamRecordResult[];
  error?: PanchangamRepositoryError;
  cache?: CacheStatus | "none";
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asArrayOfStrings(value: unknown, fallback: string[]) {
  if (Array.isArray(value)) {
    const strings = value.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0
    );
    return strings.length > 0 ? strings : fallback;
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[,|;]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return fallback;
}

function formatClockTime(value: string): string {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(.*)$/);
  if (!match) return value;

  const [, hourStr, minute, suffix] = match;
  const hour24 = Number(hourStr);
  if (!Number.isFinite(hour24)) return value;

  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  const formatted = `${hour12}:${minute} ${period}`;

  return suffix ? `${formatted} ${suffix}` : formatted;
}

function parseRangeString(value: string): { start: string; end: string } | null {
  const [start, end] = value.split(" - ");
  if (!start || !end) return null;

  return { start: formatClockTime(start.trim()), end: formatClockTime(end.trim()) };
}

function pickRange(
  row: SupabaseRow,
  candidates: string[],
  label: string,
  fallback: TimingRange
): TimingRange {
  for (const key of candidates) {
    const raw = row[key];
    if (typeof raw === "string" && raw.trim()) {
      const parsed = parseRangeString(raw.trim());
      if (parsed) {
        return { label, ...parsed };
      }
    }
  }

  return fallback;
}

// Some timing fields (Durmuhurtham, Varjyam, Amrita Kalam) can also have more
// than one period per day, numbered the same way (durmuhurtam1, durmuhurtam2,
// ...). Tries each candidate base name and returns whichever one actually has
// data, scanning until a gap is found rather than assuming a fixed count.
function collectRangeEntries(
  row: SupabaseRow,
  candidateBases: string[],
  label: string
): TimingRange[] {
  for (const base of candidateBases) {
    const entries: TimingRange[] = [];

    for (let index = 1; index <= MAX_PERIOD_ENTRIES; index++) {
      const raw = row[`${base}${index}`];
      if (typeof raw !== "string" || !raw.trim()) break;

      const parsed = parseRangeString(raw.trim());
      if (!parsed) break;

      entries.push({ label, ...parsed });
    }

    if (entries.length > 0) return entries;
  }

  return [];
}

function pick(row: SupabaseRow, candidates: string[], fallback: string) {
  for (const key of candidates) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return fallback;
}

// A day can carry more than one Tithi/Nakshatra/Yoga/Karana period (e.g. one
// ending mid-day, the next one starting after it). The schema numbers these
// as tithi1_name, tithi2_name, ... — this scans that numbered sequence until
// a gap is found, rather than assuming there is exactly one or two.
const MAX_PERIOD_ENTRIES = 6;

function collectPeriodEntries(
  row: SupabaseRow,
  baseField: string,
  options: { withPaksha?: boolean } = {}
): PanchangamPeriodEntry[] {
  const entries: PanchangamPeriodEntry[] = [];

  for (let index = 1; index <= MAX_PERIOD_ENTRIES; index++) {
    const name = row[`${baseField}${index}_name`];
    if (typeof name !== "string" || !name.trim()) break;

    const entry: PanchangamPeriodEntry = { name: name.trim() };

    if (options.withPaksha) {
      const paksha = row[`${baseField}${index}_paksha`];
      if (typeof paksha === "string" && paksha.trim()) {
        entry.paksha = paksha.trim();
      }
    }

    const endTime = row[`${baseField}${index}_end_time`];
    if (typeof endTime === "string" && endTime.trim()) {
      entry.endTime = formatClockTime(endTime.trim());
    }

    entries.push(entry);
  }

  return entries;
}

function mapSupabaseRowToDay(row: SupabaseRow): PanchangamDay {
  const rowDate = asString(row.date, todaysPanchangam.date);
  const derivedLabel = formatDateLabel(rowDate);
  const derivedVara = getWeekdayNameForDate(rowDate);

  const tithis = collectPeriodEntries(row, "tithi", { withPaksha: true });
  const nakshatras = collectPeriodEntries(row, "nakshatra");
  const yogas = collectPeriodEntries(row, "yoga");
  const karanas = collectPeriodEntries(row, "karana");

  const resolvedTithis = tithis.length > 0 ? tithis : todaysPanchangam.tithis;
  const resolvedNakshatras = nakshatras.length > 0 ? nakshatras : todaysPanchangam.nakshatras;
  const resolvedYogas = yogas.length > 0 ? yogas : todaysPanchangam.yogas;
  const resolvedKaranas = karanas.length > 0 ? karanas : todaysPanchangam.karanas;

  const durmuhurthams = collectRangeEntries(row, ["durmuhurtam", "durmuhurtham"], "Durmuhurtham");
  const varjyams = collectRangeEntries(row, ["varjyam"], "Varjyam");
  const amritaKalams = collectRangeEntries(row, ["amruta_ghadiya", "amrita_kalam"], "Amrita Kalam");

  const resolvedDurmuhurthams = durmuhurthams.length > 0 ? durmuhurthams : todaysPanchangam.durmuhurthams;
  const resolvedVarjyams = varjyams.length > 0 ? varjyams : todaysPanchangam.varjyams;
  const resolvedAmritaKalams = amritaKalams.length > 0 ? amritaKalams : todaysPanchangam.amritaKalams;

  return {
    date: rowDate,
    dateLabel: asString(row.date_label, derivedLabel),
    vara: pick(row, ["vara", "weekday", "day_name"], derivedVara),
    // Primary (first/sunrise-time) values, kept for callers that only need one.
    tithi: resolvedTithis[0]?.name ?? todaysPanchangam.tithi,
    paksha: resolvedTithis[0]?.paksha ?? todaysPanchangam.paksha,
    nakshatra: resolvedNakshatras[0]?.name ?? todaysPanchangam.nakshatra,
    yoga: resolvedYogas[0]?.name ?? todaysPanchangam.yoga,
    karana: resolvedKaranas[0]?.name ?? todaysPanchangam.karana,
    tithis: resolvedTithis,
    nakshatras: resolvedNakshatras,
    yogas: resolvedYogas,
    karanas: resolvedKaranas,
    samvatsara: pick(row, ["samvatsara"], todaysPanchangam.samvatsara),
    masa: pick(row, ["masa", "lunar_month", "month_name"], todaysPanchangam.masa),
    ayana: pick(row, ["ayana"], todaysPanchangam.ayana),
    ritu: pick(row, ["ritu", "season"], todaysPanchangam.ritu),
    location: pick(row, ["location", "location_name", "timezone"], todaysPanchangam.location),
    sunrise: formatClockTime(asString(row.sunrise, todaysPanchangam.sunrise)),
    sunset: formatClockTime(asString(row.sunset, todaysPanchangam.sunset)),
    moonrise: formatClockTime(asString(row.moonrise, todaysPanchangam.moonrise)),
    moonset: formatClockTime(asString(row.moonset, todaysPanchangam.moonset)),
    rahuKalam: pickRange(row, ["rahukalam", "rahu_kalam"], "Rahu Kalam", todaysPanchangam.rahuKalam),
    yamagandam: pickRange(row, ["yamagandam", "yama_gandam"], "Yamagandam", todaysPanchangam.yamagandam),
    gulikaKalam: pickRange(
      row,
      ["gulikakalam", "gulika_kalam"],
      "Gulika Kalam",
      todaysPanchangam.gulikaKalam
    ),
    brahmaMuhurtham: pickRange(
      row,
      ["brahma_muhurtam", "brahma_muhurtham"],
      "Brahma Muhurtham",
      todaysPanchangam.brahmaMuhurtham
    ),
    abhijitMuhurtham: pickRange(
      row,
      ["abhijit_muhurtam", "abhijit_muhurtham"],
      "Abhijit Muhurtham",
      todaysPanchangam.abhijitMuhurtham
    ),
    // Primary (first) period, kept for callers that only need a single value.
    durmuhurtham: resolvedDurmuhurthams[0] ?? todaysPanchangam.durmuhurtham,
    varjyam: resolvedVarjyams[0] ?? todaysPanchangam.varjyam,
    amritaKalam: resolvedAmritaKalams[0] ?? todaysPanchangam.amritaKalam,
    durmuhurthams: resolvedDurmuhurthams,
    varjyams: resolvedVarjyams,
    amritaKalams: resolvedAmritaKalams,
    festivals: asArrayOfStrings(row.festivals ?? row.festival_occasion, []),
    vratas: asArrayOfStrings(row.vratas, []),
  };
}

function cloneReferenceDayForDate(date: string): PanchangamDay {
  const formattedDate = formatDateLabel(date);
  const weekday = getWeekdayNameForDate(date);

  return {
    ...todaysPanchangam,
    date,
    dateLabel: formattedDate,
    vara: weekday || todaysPanchangam.vara,
  };
}

function getQueryClient() {
  return getSupabaseAdminClient();
}

// Only the columns mapSupabaseRowToDay reads — never SELECT *.
const PANCHANGAM_COLUMNS = [
  "date", "vara", "samvatsara", "masa", "ritu", "ayana",
  "sunrise", "sunset", "moonrise", "moonset",
  "tithi1_name", "tithi1_paksha", "tithi1_end_time", "tithi2_name", "tithi2_paksha", "tithi2_end_time",
  "nakshatra1_name", "nakshatra1_end_time", "nakshatra2_name", "nakshatra2_end_time",
  "yoga1_name", "yoga1_end_time", "yoga2_name", "yoga2_end_time",
  "karana1_name", "karana2_name",
  "rahukalam", "yamagandam", "gulikakalam", "brahma_muhurtam", "abhijit_muhurtam",
  "durmuhurtam1", "durmuhurtam2", "varjyam1", "varjyam2", "amruta_ghadiya1", "amruta_ghadiya2",
  "festival_occasion",
].join(",");

// A range is never larger than the API's maximum span; this is a backstop.
const MAX_RANGE_ROWS = 366;

const UNAVAILABLE: PanchangamRepositoryError = {
  code: "SUPABASE_ERROR",
  message: "Panchangam data is temporarily unavailable.",
  status: 503,
};

// Panchangam rows don't depend on the caller's location (location only shapes
// the response label), so the date alone is a complete cache key.
const cacheConfig = getApiConfig();
const dateCache = new MemoryCache<PanchangamDateLookupResult>(
  cacheConfig.cacheTtlSeconds * 1000,
  cacheConfig.cacheMaxEntries
);
const rangeCache = new MemoryCache<PanchangamRangeLookupResult>(
  cacheConfig.cacheTtlSeconds * 1000,
  Math.max(10, Math.floor(cacheConfig.cacheMaxEntries / 10))
);

export function getPanchangamCacheStats() {
  return { date: dateCache.getStats(), range: rangeCache.getStats() };
}

export function clearPanchangamCacheForTests() {
  dateCache.clear();
  rangeCache.clear();
}

function dbSignal() {
  return AbortSignal.timeout(getApiConfig().dbTimeoutMs);
}

async function queryDate(date: string): Promise<PanchangamDateLookupResult> {
  const client = getQueryClient();
  if (!client) return { error: UNAVAILABLE };

  const { data, error } = await client
    .from("daily_panchangam")
    .select(PANCHANGAM_COLUMNS)
    .eq("date", date)
    .abortSignal(dbSignal())
    .maybeSingle();

  if (error) {
    recordDatabaseFailure();
    return { error: UNAVAILABLE };
  }
  recordDatabaseSuccess();

  if (!data) {
    return {
      error: {
        code: "DATA_NOT_FOUND",
        message: "Panchangam data is not available for the requested date.",
        status: 404,
      },
    };
  }

  return { day: mapSupabaseRowToDay(data as unknown as SupabaseRow), source: "supabase" };
}

async function queryRange(startDate: string, endDate: string): Promise<PanchangamRangeLookupResult> {
  const client = getQueryClient();
  if (!client) return { error: UNAVAILABLE };

  const { data, error } = await client
    .from("daily_panchangam")
    .select(PANCHANGAM_COLUMNS)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })
    .limit(MAX_RANGE_ROWS)
    .abortSignal(dbSignal());

  if (error) {
    recordDatabaseFailure();
    return { error: UNAVAILABLE };
  }
  recordDatabaseSuccess();

  if (!data || data.length === 0) {
    return {
      error: {
        code: "DATA_NOT_FOUND",
        message: "Panchangam data is not available for the requested date range.",
        status: 404,
      },
    };
  }

  const items = (data as unknown as SupabaseRow[]).map((row) => ({
    day: mapSupabaseRowToDay(row),
    source: "supabase" as const,
  }));
  // Seed single-date entries so later lookups inside this range are hits.
  for (const item of items) {
    dateCache.set(`panchangam:date:${item.day.date}`, { day: item.day, source: "supabase" });
  }
  return { items };
}

/**
 * Without any Supabase URL (local development and the contract tests) the
 * repository serves the reference day. With a URL but no server key it
 * reports "unavailable" rather than quietly passing reference data off as real.
 */
function shouldServeReferenceData() {
  return !getQueryClient() && !isSupabaseUrlConfigured();
}

export async function fetchPanchangamByDate(date: string): Promise<PanchangamDateLookupResult> {
  if (shouldServeReferenceData()) {
    return { day: cloneReferenceDayForDate(date), source: "reference", cache: "none" };
  }
  if (isDatabaseCircuitOpen()) return { error: UNAVAILABLE, cache: "none" };

  const { value, status } = await dateCache.getOrLoad(
    `panchangam:date:${date}`,
    () => queryDate(date),
    (result) => Boolean(result.day)
  );
  return { ...value, cache: status };
}

export async function fetchPanchangamByRange(
  startDate: string,
  endDate: string
): Promise<PanchangamRangeLookupResult> {
  if (shouldServeReferenceData()) {
    return {
      items: dateRangeFallback(startDate, endDate).map((day) => ({ day, source: "reference" })),
      cache: "none",
    };
  }
  if (isDatabaseCircuitOpen()) return { error: UNAVAILABLE, cache: "none" };

  const { value, status } = await rangeCache.getOrLoad(
    `panchangam:range:${startDate}:${endDate}`,
    () => queryRange(startDate, endDate),
    (result) => Boolean(result.items)
  );
  return { ...value, cache: status };
}

export async function fetchPanchangamByMonth(
  year: number,
  month: number
): Promise<PanchangamRangeLookupResult> {
  const startDate = `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-01`;
  const end = new Date(Date.UTC(year, month, 0));
  const endDate = end.toISOString().slice(0, 10);

  return fetchPanchangamByRange(startDate, endDate);
}

function dateRangeFallback(startDate: string, endDate: string) {
  const referenceDate = todaysPanchangam.date;
  if (referenceDate >= startDate && referenceDate <= endDate) {
    return [todaysPanchangam];
  }

  return [];
}
