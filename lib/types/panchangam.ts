export interface TimingRange {
  label: string;
  start: string;
  end: string;
}

// A single Tithi/Nakshatra/Yoga/Karana period. A calendar day can contain
// more than one of these (e.g. a Tithi that ends mid-day and is followed by
// the next one) — never assume there is exactly one.
export interface PanchangamPeriodEntry {
  name: string;
  paksha?: string;
  endTime?: string;
}

export interface PanchangamDay {
  date: string;
  dateLabel: string;
  vara: string;
  /** Primary (sunrise-time) Tithi name — kept for callers that only need a single value. */
  tithi: string;
  paksha: string;
  /** Primary (sunrise-time) Nakshatra name — kept for callers that only need a single value. */
  nakshatra: string;
  yoga: string;
  karana: string;
  /** All Tithi periods for the day, in order. Length varies day to day. */
  tithis: PanchangamPeriodEntry[];
  /** All Nakshatra periods for the day, in order. Length varies day to day. */
  nakshatras: PanchangamPeriodEntry[];
  /** All Yoga periods for the day, in order. Length varies day to day. */
  yogas: PanchangamPeriodEntry[];
  /** All Karana periods for the day, in order. Length varies day to day. */
  karanas: PanchangamPeriodEntry[];
  /** Samvatsara (year name), e.g. "Parabhava (2026)". */
  samvatsara: string;
  /** Lunar month, e.g. "Bhadrapada". */
  masa: string;
  /** Solar half-year, e.g. "Dakshinayana". */
  ayana: string;
  /** Season, e.g. "Varsha". */
  ritu: string;
  location: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  rahuKalam: TimingRange;
  yamagandam: TimingRange;
  gulikaKalam: TimingRange;
  brahmaMuhurtham: TimingRange;
  abhijitMuhurtham: TimingRange;
  /** Primary (first) Durmuhurtham period — kept for callers that only need a single value. */
  durmuhurtham: TimingRange;
  /** Primary (first) Varjyam period — kept for callers that only need a single value. */
  varjyam: TimingRange;
  /** Primary (first) Amrita Kalam period — kept for callers that only need a single value. */
  amritaKalam: TimingRange;
  /** All Durmuhurtham periods for the day. A day can have more than one. */
  durmuhurthams: TimingRange[];
  /** All Varjyam periods for the day. A day can have more than one. */
  varjyams: TimingRange[];
  /** All Amrita Kalam periods for the day. A day can have more than one. */
  amritaKalams: TimingRange[];
  festivals: string[];
  /** Not currently populated by the data source — always empty. */
  vratas: string[];
}

export type DateAccessType = "full" | "preview" | "locked";

export interface DateAccessItem {
  label: string;
  date: string;
  access: DateAccessType;
  previewFields?: string[];
}

export interface LocationParameters {
  latitude: number | null;
  longitude: number | null;
  timezone: string;
}

export interface PanchangamApiMeta {
  location: LocationParameters;
  calculation_source: "dynamic" | "precomputed" | "reference";
  data_source?: "supabase" | "reference";
  access?: "full" | "preview";
  preview_fields?: string[];
}

export interface PanchangamApiSuccessResponse {
  success: true;
  data: PanchangamDay;
  meta: PanchangamApiMeta;
}

export interface PanchangamPreviewDay {
  date: string;
  dateLabel: string;
  vara: string;
  paksha: string;
  /** Primary (sunrise-time) Tithi name — kept for callers that only need a single value. */
  tithi: string;
  /** Primary (sunrise-time) Nakshatra name — kept for callers that only need a single value. */
  nakshatra: string;
  /** All Tithi periods for the day, in order. Length varies day to day. */
  tithis: PanchangamPeriodEntry[];
  /** All Nakshatra periods for the day, in order. Length varies day to day. */
  nakshatras: PanchangamPeriodEntry[];
  festivals: string[];
  location: string;
  access: "preview";
  previewFields: string[];
  upgradeMessage: string;
}

export interface PanchangamApiPreviewResponse {
  success: true;
  data: PanchangamPreviewDay;
  meta: PanchangamApiMeta;
}

export interface PanchangamApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
