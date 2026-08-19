export interface TimingRange {
  label: string;
  start: string;
  end: string;
}

export interface PanchangamDay {
  date: string;
  dateLabel: string;
  vara: string;
  tithi: string;
  paksha: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  location: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  rahuKalam: TimingRange;
  yamagandam: TimingRange;
  gulikaKalam: TimingRange;
  durmuhurtham: TimingRange;
  varjyam: TimingRange;
  amritaKalam: TimingRange;
  abhijitMuhurtham: TimingRange;
  festivals: string[];
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
  tithi: string;
  nakshatra: string;
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
