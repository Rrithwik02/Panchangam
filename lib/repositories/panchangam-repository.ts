import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { todaysPanchangam } from "@/lib/mock-panchangam";
import type { PanchangamDay, TimingRange } from "@/lib/types/panchangam";

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
}

export interface PanchangamRangeLookupResult {
  items?: PanchangamRecordResult[];
  error?: PanchangamRepositoryError;
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

function asTimingRange(
  row: SupabaseRow,
  prefix: string,
  fallback: TimingRange
): TimingRange {
  const start = asString(row[`${prefix}_start`], fallback.start);
  const end = asString(row[`${prefix}_end`], fallback.end);
  return {
    label: fallback.label,
    start,
    end,
  };
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

function mapSupabaseRowToDay(row: SupabaseRow): PanchangamDay {
  return {
    date: asString(row.date, todaysPanchangam.date),
    dateLabel: asString(row.date_label, todaysPanchangam.dateLabel),
    vara: pick(row, ["vara", "weekday", "day_name"], todaysPanchangam.vara),
    tithi: pick(
      row,
      ["tithi", "tithi_name", "tithi1_name"],
      todaysPanchangam.tithi
    ),
    paksha: pick(
      row,
      ["paksha", "tithi_paksha", "tithi1_paksha"],
      todaysPanchangam.paksha
    ),
    nakshatra: pick(
      row,
      ["nakshatra", "nakshatra_name", "nakshatra1_name"],
      todaysPanchangam.nakshatra
    ),
    yoga: pick(row, ["yoga", "yoga_name", "yoga1_name"], todaysPanchangam.yoga),
    karana: pick(row, ["karana", "karana_name", "karana1_name"], todaysPanchangam.karana),
    location: pick(row, ["location", "location_name", "timezone"], todaysPanchangam.location),
    sunrise: asString(row.sunrise, todaysPanchangam.sunrise),
    sunset: asString(row.sunset, todaysPanchangam.sunset),
    moonrise: asString(row.moonrise, todaysPanchangam.moonrise),
    moonset: asString(row.moonset, todaysPanchangam.moonset),
    rahuKalam: asTimingRange(row, "rahu_kalam", todaysPanchangam.rahuKalam),
    yamagandam: asTimingRange(row, "yamagandam", todaysPanchangam.yamagandam),
    gulikaKalam: asTimingRange(row, "gulika_kalam", todaysPanchangam.gulikaKalam),
    durmuhurtham: asTimingRange(row, "durmuhurtham", todaysPanchangam.durmuhurtham),
    varjyam: asTimingRange(row, "varjyam", todaysPanchangam.varjyam),
    amritaKalam: asTimingRange(row, "amrita_kalam", todaysPanchangam.amritaKalam),
    abhijitMuhurtham: asTimingRange(
      row,
      "abhijit_muhurtham",
      todaysPanchangam.abhijitMuhurtham
    ),
    festivals: asArrayOfStrings(row.festivals ?? row.festival_occasion, todaysPanchangam.festivals),
    vratas: asArrayOfStrings(row.vratas, todaysPanchangam.vratas),
  };
}

function cloneReferenceDayForDate(date: string): PanchangamDay {
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));

  return {
    ...todaysPanchangam,
    date,
    dateLabel: formattedDate,
  };
}

function getQueryClient() {
  return getSupabaseAdminClient();
}

export async function fetchPanchangamByDate(date: string): Promise<PanchangamDateLookupResult> {
  const client = getQueryClient();
  if (!client) {
    return { day: cloneReferenceDayForDate(date), source: "reference" };
  }

  const { data, error } = await client
    .from("daily_panchangam")
    .select("*")
    .eq("date", date)
    .maybeSingle();

  if (error) {
    return {
      error: {
        code: "SUPABASE_ERROR",
        message: "Unable to read Panchangam data from Supabase.",
        status: 502,
      },
    };
  }

  if (!data) {
    return {
      error: {
        code: "DATA_NOT_FOUND",
        message: "Panchangam data is not available for the requested date.",
        status: 404,
      },
    };
  }

  return { day: mapSupabaseRowToDay(data), source: "supabase" };
}

export async function fetchPanchangamByRange(
  startDate: string,
  endDate: string
): Promise<PanchangamRangeLookupResult> {
  const client = getQueryClient();
  if (!client) {
    return {
      items: dateRangeFallback(startDate, endDate).map((day) => ({ day, source: "reference" })),
    };
  }

  const { data, error } = await client
    .from("daily_panchangam")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) {
    return {
      error: {
        code: "SUPABASE_ERROR",
        message: "Unable to read Panchangam data from Supabase.",
        status: 502,
      },
    };
  }

  if (!data || data.length === 0) {
    return {
      error: {
        code: "DATA_NOT_FOUND",
        message: "Panchangam data is not available for the requested date range.",
        status: 404,
      },
    };
  }

  return {
    items: data.map((row) => ({ day: mapSupabaseRowToDay(row), source: "supabase" as const })),
  };
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
