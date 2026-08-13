import type { MoonPhaseInfo } from "./moon-phase";

export type DayPhase = "night" | "dawn" | "day" | "dusk";
export type SiteTheme = "light" | "dark";

export interface CelestialPosition {
  x: number;
  y: number;
  visible: boolean;
  progress: number;
}

export interface DayPhaseInfo {
  phase: DayPhase;
  theme: SiteTheme;
  greeting: string;
  label: string;
  sunOpacity: number;
  moonOpacity: number;
  starsOpacity: number;
  skyProgress: number;
  sun: CelestialPosition;
  moon: CelestialPosition;
}

const DAWN_WINDOW_BEFORE = 50;
const DAWN_WINDOW_AFTER = 40;
const DUSK_WINDOW_BEFORE = 35;
const DUSK_WINDOW_AFTER = 55;

const ARC = {
  leftX: 72,
  rightX: 728,
  horizonY: 390,
  apexY: 95,
};

export function parseTime12h(time: string): number {
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function normalizeMinutes(minutes: number) {
  let m = minutes;
  while (m < 0) m += 1440;
  while (m >= 1440) m -= 1440;
  return m;
}

/** Arc path: rises from left, peaks at center, sets to right */
export function getCelestialPosition(
  nowMinutes: number,
  riseMinutes: number,
  setMinutes: number
): CelestialPosition {
  const now = normalizeMinutes(nowMinutes);
  const rise = normalizeMinutes(riseMinutes);
  const set = normalizeMinutes(setMinutes);

  let progress: number;
  let visible: boolean;

  if (rise < set) {
    visible = now >= rise && now <= set;
    progress = visible ? (now - rise) / (set - rise) : now < rise ? 0 : 1;
  } else {
    visible = now >= rise || now <= set;
    const span = 1440 - rise + set;
    const elapsed =
      now >= rise ? now - rise : now <= set ? 1440 - rise + now : -1;
    progress = visible && elapsed >= 0 ? elapsed / span : now < rise ? 0 : 1;
  }

  progress = clamp(progress, 0, 1);

  const x = lerp(ARC.leftX, ARC.rightX, progress);
  const arcHeight = Math.sin(progress * Math.PI) * (ARC.horizonY - ARC.apexY);
  const y = ARC.horizonY - arcHeight;

  return { x, y, visible, progress };
}

export function getDayPhase(
  now: Date,
  sunrise: string,
  sunset: string
): DayPhase {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const sunriseMin = parseTime12h(sunrise);
  const sunsetMin = parseTime12h(sunset);

  const dawnStart = sunriseMin - DAWN_WINDOW_BEFORE;
  const dawnEnd = sunriseMin + DAWN_WINDOW_AFTER;
  const duskStart = sunsetMin - DUSK_WINDOW_BEFORE;
  const duskEnd = sunsetMin + DUSK_WINDOW_AFTER;

  if (minutes >= dawnStart && minutes < dawnEnd) return "dawn";
  if (minutes >= dawnEnd && minutes < duskStart) return "day";
  if (minutes >= duskStart && minutes < duskEnd) return "dusk";
  return "night";
}

export function getSiteTheme(phase: DayPhase): SiteTheme {
  return phase === "night" || phase === "dusk" ? "dark" : "light";
}

export function getGreeting(phase: DayPhase): string {
  switch (phase) {
    case "dawn":
      return "Good Morning";
    case "day":
      return "Good Day";
    case "dusk":
      return "Good Evening";
    case "night":
      return "Good Night";
  }
}

export function getPhaseLabel(phase: DayPhase): string {
  switch (phase) {
    case "dawn":
      return "Dawn";
    case "day":
      return "Daytime";
    case "dusk":
      return "Dusk";
    case "night":
      return "Night";
  }
}

export function getDayPhaseInfo(
  now: Date,
  sunrise: string,
  sunset: string,
  moonrise: string,
  moonset: string,
  moonPhase: MoonPhaseInfo
): DayPhaseInfo {
  const phase = getDayPhase(now, sunrise, sunset);
  const minutes = now.getHours() * 60 + now.getMinutes();
  const sunriseMin = parseTime12h(sunrise);
  const sunsetMin = parseTime12h(sunset);
  const moonriseMin = parseTime12h(moonrise);
  const moonsetMin = parseTime12h(moonset);

  const dawnStart = sunriseMin - DAWN_WINDOW_BEFORE;
  const dawnEnd = sunriseMin + DAWN_WINDOW_AFTER;
  const duskStart = sunsetMin - DUSK_WINDOW_BEFORE;
  const duskEnd = sunsetMin + DUSK_WINDOW_AFTER;

  const sun = getCelestialPosition(minutes, sunriseMin, sunsetMin);
  const moon = getCelestialPosition(minutes, moonriseMin, moonsetMin);

  let sunOpacity = 0;
  let moonOpacity = 0;
  let starsOpacity = 0;
  let skyProgress = 0.5;

  switch (phase) {
    case "dawn": {
      const t = clamp((minutes - dawnStart) / (dawnEnd - dawnStart), 0, 1);
      sunOpacity = sun.visible ? lerp(0.15, 1, t) : 0;
      moonOpacity =
        moon.visible && moonPhase.isVisible
          ? lerp(0.5 * moonPhase.illumination, 0, t)
          : 0;
      starsOpacity = lerp(0.45, 0, t);
      skyProgress = lerp(0.15, 0.45, t);
      break;
    }
    case "day": {
      sunOpacity = sun.visible ? 1 : 0;
      moonOpacity = moon.visible && moonPhase.isVisible ? moonPhase.illumination * 0.35 : 0;
      starsOpacity = 0;
      const daySpan = Math.max(duskStart - dawnEnd, 1);
      skyProgress = lerp(0.45, 0.72, (minutes - dawnEnd) / daySpan);
      break;
    }
    case "dusk": {
      const t = clamp((minutes - duskStart) / (duskEnd - duskStart), 0, 1);
      sunOpacity = sun.visible ? lerp(1, 0.1, t) : 0;
      moonOpacity =
        moon.visible && moonPhase.isVisible
          ? lerp(0, moonPhase.illumination, t)
          : 0;
      starsOpacity = lerp(0, 0.7, t);
      skyProgress = lerp(0.72, 0.95, t);
      break;
    }
    case "night": {
      sunOpacity = 0;
      moonOpacity =
        moon.visible && moonPhase.isVisible ? moonPhase.illumination : 0;
      starsOpacity = 0.85;
      skyProgress = minutes < dawnStart ? 0.98 : 0.08;
      break;
    }
  }

  return {
    phase,
    theme: getSiteTheme(phase),
    greeting: getGreeting(phase),
    label: getPhaseLabel(phase),
    sunOpacity,
    moonOpacity,
    starsOpacity,
    skyProgress,
    sun,
    moon,
  };
}

export function formatCurrentTime(now: Date): string {
  return now.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
