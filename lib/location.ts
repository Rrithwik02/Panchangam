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
  cityName?: string;
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

/** Reverse geocodes latitude/longitude to a friendly city name */
export async function fetchCityFromCoordinates(lat: number, lon: number): Promise<string | null> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.city || data.locality || data.principalSubdivision || null;
  } catch {
    return null;
  }
}

/** Formats location nicely without raw lat/long coordinates */
export function formatLocationCity(location: LocationParameters, customCityName?: string | null) {
  if (customCityName) {
    return customCityName;
  }

  if (location.timezone === "Asia/Kolkata") {
    return "Hyderabad";
  }

  const parts = location.timezone.split("/");
  if (parts.length >= 2) {
    return parts[parts.length - 1].replace(/_/g, " ");
  }

  return "Your location";
}

export function formatLocationLabel(location: LocationParameters, customCityName?: string | null) {
  const city = formatLocationCity(location, customCityName);
  return `Panchangam for ${city} · Local time · ${location.timezone}`;
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
