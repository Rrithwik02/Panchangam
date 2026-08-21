import { todaysPanchangam } from "@/lib/mock-panchangam";
import {
  formatLocationLabel,
  isValidLatitude,
  isValidLongitude,
  isValidTimezone,
} from "@/lib/location";
import type {
  LocationParameters,
  PanchangamApiErrorResponse,
  PanchangamApiMeta,
  PanchangamApiPreviewResponse,
  PanchangamApiSuccessResponse,
  PanchangamDay,
  PanchangamPreviewDay,
} from "@/lib/types/panchangam";

export interface QueryLocation {
  latitude: string | null;
  longitude: string | null;
  timezone: string | null;
}

export type PanchangamListResponse<T> =
  | {
      success: true;
      data: {
        items: T[];
        total_records: number;
      };
      meta: PanchangamApiMeta & {
        start_date?: string;
        end_date?: string;
        year?: number;
        month?: number;
      };
    }
  | PanchangamApiErrorResponse;

export function buildListResponse<T>(
  items: T[],
  location: LocationParameters,
  extras?: Partial<PanchangamApiMeta> & {
    start_date?: string;
    end_date?: string;
    year?: number;
    month?: number;
  }
): PanchangamListResponse<T> {
  return {
    success: true,
    data: {
      items,
      total_records: items.length,
    },
    meta: {
      location,
      calculation_source: "precomputed",
      ...extras,
    },
  };
}

export interface PanchangamCalendarData {
  date: string;
  vara: string;
  paksha: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
}

export interface PanchangamFestivalData {
  date: string;
  festivals: string[];
  vratas: string[];
}

export const REFERENCE_DAY: PanchangamDay = todaysPanchangam;

export function createErrorResponse(
  code: string,
  message: string,
  status = 400
): Response {
  const body: PanchangamApiErrorResponse = {
    success: false,
    error: { code, message },
  };

  return Response.json(body, { status });
}

export function parseStrictDate(date: string | null) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function formatDateLabel(dateStr: string): string {
  const parsed = parseStrictDate(dateStr);
  if (!parsed) return dateStr;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export function getWeekdayNameForDate(dateStr: string): string {
  const parsed = parseStrictDate(dateStr);
  if (!parsed) return "";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "UTC",
  }).format(parsed);
}

export function getCurrentReferenceDate() {
  const override = process.env.PANCHANGAM_TEST_NOW;
  if (override) {
    const parsed = new Date(override);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
}

export function formatDateInTimeZone(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    return "";
  }

  return `${year}-${month}-${day}`;
}

export function shiftDateString(date: string, days: number) {
  const parsed = parseStrictDate(date);
  if (!parsed) {
    return null;
  }

  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

export function getLocalDateForTimezone(timezone: string, date = getCurrentReferenceDate()) {
  return formatDateInTimeZone(date, timezone);
}

export function getRelativeDateForTimezone(
  timezone: string,
  offsetDays: number,
  date = getCurrentReferenceDate()
) {
  const localDate = getLocalDateForTimezone(timezone, date);
  return shiftDateString(localDate, offsetDays);
}

export function getTodayDateForTimezone(timezone: string, date = getCurrentReferenceDate()) {
  return getRelativeDateForTimezone(timezone, 0, date);
}

export function getYesterdayDateForTimezone(timezone: string, date = getCurrentReferenceDate()) {
  return getRelativeDateForTimezone(timezone, -1, date);
}

export function getTomorrowDateForTimezone(timezone: string, date = getCurrentReferenceDate()) {
  return getRelativeDateForTimezone(timezone, 1, date);
}

export function normalizeLocation(query: QueryLocation): {
  location: LocationParameters;
  error?: Response;
} {
  const timezone = query.timezone ?? "";

  if (!timezone) {
    return {
      location: { latitude: null, longitude: null, timezone: "" },
      error: createErrorResponse("INVALID_TIMEZONE", "The timezone query parameter is required."),
    };
  }

  if (!isValidTimezone(timezone)) {
    return {
      location: { latitude: null, longitude: null, timezone },
      error: createErrorResponse("INVALID_TIMEZONE", "The supplied timezone is not valid."),
    };
  }

  if (query.latitude === null && query.longitude === null) {
    return {
      location: { latitude: null, longitude: null, timezone },
    };
  }

  if (query.latitude === null || query.longitude === null) {
    return {
      location: { latitude: null, longitude: null, timezone },
      error: createErrorResponse(
        "INVALID_LOCATION",
        "Latitude and longitude must either both be provided or both be omitted."
      ),
    };
  }

  const latitude = Number(query.latitude);
  const longitude = Number(query.longitude);

  if (!isValidLatitude(latitude)) {
    return {
      location: { latitude: null, longitude: null, timezone },
      error: createErrorResponse("INVALID_LATITUDE", "Latitude must be between -90 and 90."),
    };
  }

  if (!isValidLongitude(longitude)) {
    return {
      location: { latitude: null, longitude: null, timezone },
      error: createErrorResponse("INVALID_LONGITUDE", "Longitude must be between -180 and 180."),
    };
  }

  return {
    location: { latitude, longitude, timezone },
  };
}

export function buildMeta(
  location: LocationParameters,
  source: PanchangamApiMeta["calculation_source"],
  extras?: Partial<PanchangamApiMeta>
): PanchangamApiMeta {
  return {
    location,
    calculation_source: source,
    ...extras,
  };
}

export function buildDayResponse(
  day: PanchangamDay,
  location: LocationParameters,
  source: PanchangamApiMeta["calculation_source"] = "precomputed"
): PanchangamApiSuccessResponse {
  return {
    success: true,
    data: {
      ...day,
      location: formatLocationLabel(location),
    },
    meta: buildMeta(location, source),
  };
}

export function buildPreviewDayResponse(
  day: PanchangamDay,
  location: LocationParameters,
  source: PanchangamApiMeta["calculation_source"] = "precomputed"
): PanchangamApiPreviewResponse {
  const previewFields = ["Date", "Vara", "Paksha", "Tithi", "Nakshatra"];
  const data: PanchangamPreviewDay = {
    date: day.date,
    dateLabel: day.dateLabel,
    vara: day.vara,
    paksha: day.paksha,
    tithi: day.tithi,
    nakshatra: day.nakshatra,
    location: formatLocationLabel(location),
    access: "preview",
    previewFields,
    upgradeMessage: "Full future-date access is available with Premium.",
  };

  return {
    success: true,
    data,
    meta: buildMeta(location, source, {
      access: "preview",
      preview_fields: previewFields,
    }),
  };
}

export function availableDays() {
  return [REFERENCE_DAY];
}

export function dayMatches(date: string, day: PanchangamDay) {
  return day.date === date;
}

export function findDayByDate(date: string) {
  return availableDays().find((day) => dayMatches(date, day)) ?? null;
}

export function getYesterdayDate(date: string) {
  return shiftDateString(date, -1);
}

export function getTomorrowDate(date: string) {
  return shiftDateString(date, 1);
}

export function filterDaysByRange(startDate: string, endDate: string) {
  const start = parseStrictDate(startDate);
  const end = parseStrictDate(endDate);
  if (!start || !end) {
    return null;
  }

  if (start.getTime() > end.getTime()) {
    return null;
  }

  return availableDays().filter((day) => {
    const current = parseStrictDate(day.date);
    if (!current) return false;
    return current.getTime() >= start.getTime() && current.getTime() <= end.getTime();
  });
}

export function filterDaysByMonth(year: number, month: number) {
  return availableDays().filter((day) => {
    const current = parseStrictDate(day.date);
    if (!current) return false;
    return current.getUTCFullYear() === year && current.getUTCMonth() + 1 === month;
  });
}

export function mapCalendarDay(day: PanchangamDay): PanchangamCalendarData {
  return {
    date: day.date,
    vara: day.vara,
    paksha: day.paksha,
    tithi: day.tithi,
    nakshatra: day.nakshatra,
    yoga: day.yoga,
    karana: day.karana,
  };
}

export function mapFestivalDay(day: PanchangamDay): PanchangamFestivalData {
  return {
    date: day.date,
    festivals: day.festivals,
    vratas: day.vratas,
  };
}
