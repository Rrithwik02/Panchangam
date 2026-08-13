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
