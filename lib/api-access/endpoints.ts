import {
  buildDayResponse,
  buildListResponse,
  getRelativeDateForTimezone,
  mapCalendarDay,
  mapFestivalDay,
} from "@/lib/api/panchangam";
import {
  fetchPanchangamByDate,
  fetchPanchangamByMonth,
  fetchPanchangamByRange,
  type PanchangamRangeLookupResult,
  type PanchangamRepositoryError,
} from "@/lib/repositories/panchangam-repository";
import type { CacheStatus } from "@/lib/cache/memory-cache";
import type { LocationParameters } from "@/lib/types/panchangam";
import type { ApiConfig } from "./config";
import { DEFAULT_MESSAGES, type ApiErrorCode } from "./errors";
import {
  isSupportedDate,
  LOCATION_PARAMS,
  parseDateParam,
  parseLocation,
  parseRange,
  parseYearMonth,
  type Parsed,
} from "./validation";

// The complete, explicit list of paid API endpoints. Each one declares the
// query parameters it accepts, validates them strictly, and reads through the
// existing (cached) Panchangam repository — there is no generic query path.

export interface EndpointResult {
  status: number;
  body: unknown;
  cache: CacheStatus | "none";
  error?: ApiErrorCode;
  retryAfter?: number;
}

export interface ApiEndpoint<P> {
  /** Stable name used in logs and metrics (never includes the query). */
  path: string;
  params: readonly string[];
  parse(query: Map<string, string>, config: ApiConfig): Parsed<P>;
  run(params: P): Promise<EndpointResult>;
}

function failure(error: PanchangamRepositoryError | undefined, cache: EndpointResult["cache"]): EndpointResult {
  if (error?.code === "DATA_NOT_FOUND") {
    return { status: 404, body: errorBody("not_found"), cache, error: "not_found" };
  }
  return {
    status: 503,
    body: errorBody("service_unavailable"),
    cache,
    error: "service_unavailable",
    retryAfter: 30,
  };
}

function errorBody(code: ApiErrorCode) {
  return { success: false, error: code, message: DEFAULT_MESSAGES[code] };
}

function meta(
  location: LocationParameters,
  dataSource: "supabase" | "reference" | undefined,
  extras: Record<string, unknown> = {}
) {
  return {
    location,
    calculation_source: "precomputed" as const,
    data_source: dataSource ?? "supabase",
    access: "full" as const,
    ...extras,
  };
}

async function dayResult(date: string, location: LocationParameters): Promise<EndpointResult> {
  const result = await fetchPanchangamByDate(date);
  const cache = result.cache ?? "none";
  if (!result.day) return failure(result.error, cache);
  return {
    status: 200,
    cache,
    body: {
      success: true,
      data: buildDayResponse(result.day, location).data,
      meta: meta(location, result.source),
    },
  };
}

function listResult<T>(
  result: PanchangamRangeLookupResult,
  location: LocationParameters,
  map: (day: NonNullable<PanchangamRangeLookupResult["items"]>[number]["day"]) => T,
  extras: Record<string, unknown>
): EndpointResult {
  const cache = result.cache ?? "none";
  if (!result.items || result.items.length === 0) return failure(result.error, cache);
  const body = buildListResponse(result.items.map((item) => map(item.day)), location, extras);
  if (body.success) {
    body.meta = { ...body.meta, ...meta(location, result.items[0]?.source), ...extras };
  }
  return { status: 200, cache, body };
}

type LocationOnly = { location: LocationParameters };

function relativeDay(path: string, offset: -1 | 0 | 1): ApiEndpoint<LocationOnly> {
  return {
    path,
    params: LOCATION_PARAMS,
    parse(query) {
      const location = parseLocation(query);
      return location.ok ? { ok: true, value: { location: location.value } } : location;
    },
    async run({ location }) {
      const date = getRelativeDateForTimezone(location.timezone, offset);
      if (!date || !isSupportedDate(date)) {
        return { status: 404, body: errorBody("not_found"), cache: "none", error: "not_found" };
      }
      return dayResult(date, location);
    },
  };
}

// API customers get the full Panchangam for every supported date, including
// Tomorrow (the website's Free preview does not apply to the paid API).
export const panchangamToday = relativeDay("/v1/panchangam/today", 0);
export const panchangamYesterday = relativeDay("/v1/panchangam/yesterday", -1);
export const panchangamTomorrow = relativeDay("/v1/panchangam/tomorrow", 1);

export const panchangamDate: ApiEndpoint<LocationOnly & { date: string }> = {
  path: "/v1/panchangam/date",
  params: ["date", ...LOCATION_PARAMS],
  parse(query) {
    const date = parseDateParam(query, "date");
    if (!date.ok) return date;
    const location = parseLocation(query);
    if (!location.ok) return location;
    return { ok: true, value: { date: date.value, location: location.value } };
  },
  run: ({ date, location }) => dayResult(date, location),
};

export const panchangamRange: ApiEndpoint<LocationOnly & { startDate: string; endDate: string }> = {
  path: "/v1/panchangam/range",
  params: ["start_date", "end_date", ...LOCATION_PARAMS],
  parse(query, config) {
    const range = parseRange(query, config.maxRangeDays);
    if (!range.ok) return range;
    const location = parseLocation(query);
    if (!location.ok) return location;
    return { ok: true, value: { ...range.value, location: location.value } };
  },
  async run({ startDate, endDate, location }) {
    const result = await fetchPanchangamByRange(startDate, endDate);
    return listResult(result, location, (day) => buildDayResponse(day, location).data, {
      start_date: startDate,
      end_date: endDate,
    });
  },
};

type MonthParams = LocationOnly & { year: number; month: number };

function monthEndpoint<T>(
  path: string,
  map: (day: Parameters<typeof mapCalendarDay>[0], location: LocationParameters) => T
): ApiEndpoint<MonthParams> {
  return {
    path,
    params: ["year", "month", ...LOCATION_PARAMS],
    parse(query) {
      const ym = parseYearMonth(query);
      if (!ym.ok) return ym;
      const location = parseLocation(query);
      if (!location.ok) return location;
      return { ok: true, value: { ...ym.value, location: location.value } };
    },
    async run({ year, month, location }) {
      const result = await fetchPanchangamByMonth(year, month);
      return listResult(result, location, (day) => map(day, location), { year, month });
    },
  };
}

export const panchangamMonth = monthEndpoint("/v1/panchangam/month", (day, location) =>
  buildDayResponse(day, location).data
);
export const calendarMonth = monthEndpoint("/v1/calendar/month", (day) => mapCalendarDay(day));
export const festivalsMonth = monthEndpoint("/v1/festivals/month", (day) => mapFestivalDay(day));

export const SUPPORTED_ENDPOINTS = [
  panchangamToday,
  panchangamYesterday,
  panchangamTomorrow,
  panchangamDate,
  panchangamRange,
  panchangamMonth,
  calendarMonth,
  festivalsMonth,
] as const;
