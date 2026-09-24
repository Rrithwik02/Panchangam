import { isValidLatitude, isValidLongitude, isValidTimezone } from "@/lib/location";
import { SUPPORTED_RANGE } from "@/lib/billing/plans";
import type { LocationParameters } from "@/lib/types/panchangam";

// Allow-list validation for API query strings. Anything not explicitly
// supported is rejected before authentication touches the database, so
// malformed, oversized or injection-style input never reaches a query.

export type Parsed<T> = { ok: true; value: T } | { ok: false; message: string };

const MAX_QUERY_LENGTH = 512;
const MAX_VALUE_LENGTH = 64;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const COORDINATE_PATTERN = /^-?\d{1,3}(\.\d{1,8})?$/;
const YEAR_PATTERN = /^\d{4}$/;
const MONTH_PATTERN = /^(0?[1-9]|1[0-2])$/;

/** Query parameter names that would put a secret in the URL. */
const CREDENTIAL_PARAMS = new Set(["api_key", "apikey", "key", "token", "access_token", "authorization"]);

export const LOCATION_PARAMS = ["timezone", "latitude", "longitude"] as const;

export function hasCredentialInUrl(url: URL) {
  for (const name of url.searchParams.keys()) {
    if (CREDENTIAL_PARAMS.has(name.toLowerCase())) return true;
  }
  return false;
}

function safeName(name: string) {
  return name.replace(/[^A-Za-z0-9_\-]/g, "").slice(0, 32) || "(unnamed)";
}

/** Only allowed names, each at most once, with short values. */
export function readQuery(url: URL, allowed: readonly string[]): Parsed<Map<string, string>> {
  if (url.search.length > MAX_QUERY_LENGTH) return { ok: false, message: "Query string is too long." };

  const values = new Map<string, string>();
  for (const [name, value] of url.searchParams) {
    if (!allowed.includes(name)) {
      return { ok: false, message: `Unsupported query parameter: ${safeName(name)}.` };
    }
    if (values.has(name)) return { ok: false, message: `Query parameter repeated: ${name}.` };
    if (value.length > MAX_VALUE_LENGTH) return { ok: false, message: `Query parameter too long: ${name}.` };
    values.set(name, value);
  }
  return { ok: true, value: values };
}

export function parseLocation(query: Map<string, string>): Parsed<LocationParameters> {
  const timezone = query.get("timezone");
  if (!timezone) return { ok: false, message: "The timezone query parameter is required (e.g. Asia/Kolkata)." };
  if (!/^[A-Za-z0-9_+\-/]{1,64}$/.test(timezone) || !isValidTimezone(timezone)) {
    return { ok: false, message: "The supplied timezone is not a valid IANA timezone." };
  }

  const lat = query.get("latitude");
  const lon = query.get("longitude");
  if (lat === undefined && lon === undefined) {
    return { ok: true, value: { latitude: null, longitude: null, timezone } };
  }
  if (lat === undefined || lon === undefined) {
    return { ok: false, message: "Latitude and longitude must either both be provided or both be omitted." };
  }
  if (!COORDINATE_PATTERN.test(lat) || !isValidLatitude(Number(lat))) {
    return { ok: false, message: "Latitude must be a number between -90 and 90." };
  }
  if (!COORDINATE_PATTERN.test(lon) || !isValidLongitude(Number(lon))) {
    return { ok: false, message: "Longitude must be a number between -180 and 180." };
  }
  return { ok: true, value: { latitude: Number(lat), longitude: Number(lon), timezone } };
}

export function isRealDate(value: string) {
  if (!DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function isSupportedDate(value: string) {
  return value >= SUPPORTED_RANGE.start && value <= SUPPORTED_RANGE.end;
}

const RANGE_MESSAGE = `Dates must be between ${SUPPORTED_RANGE.start} and ${SUPPORTED_RANGE.end}.`;

export function parseDateParam(query: Map<string, string>, name: string): Parsed<string> {
  const value = query.get(name);
  if (!value) return { ok: false, message: `The ${name} query parameter is required (YYYY-MM-DD).` };
  if (!isRealDate(value)) return { ok: false, message: `Invalid ${name}. Use a real date in YYYY-MM-DD format.` };
  if (!isSupportedDate(value)) return { ok: false, message: RANGE_MESSAGE };
  return { ok: true, value };
}

export function daysBetweenInclusive(start: string, end: string) {
  const ms = Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`);
  return Math.round(ms / 86_400_000) + 1;
}

export function parseRange(
  query: Map<string, string>,
  maxDays: number
): Parsed<{ startDate: string; endDate: string }> {
  const start = parseDateParam(query, "start_date");
  if (!start.ok) return start;
  const end = parseDateParam(query, "end_date");
  if (!end.ok) return end;
  if (start.value > end.value) return { ok: false, message: "start_date must be on or before end_date." };
  if (daysBetweenInclusive(start.value, end.value) > maxDays) {
    return { ok: false, message: `A range can cover at most ${maxDays} days.` };
  }
  return { ok: true, value: { startDate: start.value, endDate: end.value } };
}

export function parseYearMonth(query: Map<string, string>): Parsed<{ year: number; month: number }> {
  const year = query.get("year");
  const month = query.get("month");
  if (!year || !YEAR_PATTERN.test(year)) return { ok: false, message: "A four-digit year is required." };
  if (!month || !MONTH_PATTERN.test(month)) return { ok: false, message: "A month between 1 and 12 is required." };

  const y = Number(year);
  const m = Number(month);
  const first = `${year}-${String(m).padStart(2, "0")}-01`;
  const last = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  // The month must overlap the supported dataset.
  if (last < SUPPORTED_RANGE.start || first > SUPPORTED_RANGE.end) return { ok: false, message: RANGE_MESSAGE };
  return { ok: true, value: { year: y, month: m } };
}
