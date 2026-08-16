import type { LocationParameters } from "@/lib/types/panchangam";

export type BrowserLocationStatus =
  | "idle"
  | "loading"
  | "resolved"
  | "denied"
  | "unavailable"
  | "error";

export interface BrowserLocationState extends LocationParameters {
  status: BrowserLocationStatus;
  errorMessage?: string;
}

export function getBrowserTimezone(fallback = "UTC") {
  if (typeof Intl === "undefined" || typeof Intl.DateTimeFormat === "undefined") {
    return fallback;
  }

  return Intl.DateTimeFormat().resolvedOptions().timeZone || fallback;
}

export function isValidTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function isValidLatitude(latitude: number) {
  return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90;
}

export function isValidLongitude(longitude: number) {
  return Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
}

export function formatCoordinate(value: number) {
  return value.toFixed(4);
}

export function formatLocationLabel(location: LocationParameters) {
  const coordinates =
    location.latitude !== null && location.longitude !== null
      ? `${formatCoordinate(location.latitude)}, ${formatCoordinate(location.longitude)}`
      : "Timezone only";

  return `${coordinates} · ${location.timezone}`;
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

export function buildLocationSearchParams(location: LocationParameters & { date: string }) {
  const params = new URLSearchParams({ date: location.date, timezone: location.timezone });

  if (location.latitude !== null && location.longitude !== null) {
    params.set("latitude", location.latitude.toString());
    params.set("longitude", location.longitude.toString());
  }

  return params;
}
