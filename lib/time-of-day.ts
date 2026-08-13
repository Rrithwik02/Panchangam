export type DayPhase = "night" | "dawn" | "day" | "dusk";

export interface DayPhaseInfo {
  phase: DayPhase;
  greeting: string;
  label: string;
  sunOpacity: number;
  moonOpacity: number;
  starsOpacity: number;
  skyProgress: number;
}

const DAWN_WINDOW_BEFORE = 50;
const DAWN_WINDOW_AFTER = 40;
const DUSK_WINDOW_BEFORE = 35;
const DUSK_WINDOW_AFTER = 55;

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
  sunset: string
): DayPhaseInfo {
  const phase = getDayPhase(now, sunrise, sunset);
  const minutes = now.getHours() * 60 + now.getMinutes();
  const sunriseMin = parseTime12h(sunrise);
  const sunsetMin = parseTime12h(sunset);

  const dawnStart = sunriseMin - DAWN_WINDOW_BEFORE;
  const dawnEnd = sunriseMin + DAWN_WINDOW_AFTER;
  const duskStart = sunsetMin - DUSK_WINDOW_BEFORE;
  const duskEnd = sunsetMin + DUSK_WINDOW_AFTER;

  let sunOpacity = 0;
  let moonOpacity = 0;
  let starsOpacity = 0;
  let skyProgress = 0.5;

  switch (phase) {
    case "dawn": {
      const t = clamp((minutes - dawnStart) / (dawnEnd - dawnStart), 0, 1);
      sunOpacity = lerp(0.2, 1, t);
      moonOpacity = lerp(0.7, 0, t);
      starsOpacity = lerp(0.5, 0, t);
      skyProgress = lerp(0.15, 0.45, t);
      break;
    }
    case "day": {
      sunOpacity = 1;
      moonOpacity = 0;
      starsOpacity = 0;
      const daySpan = Math.max(duskStart - dawnEnd, 1);
      skyProgress = lerp(0.45, 0.72, (minutes - dawnEnd) / daySpan);
      break;
    }
    case "dusk": {
      const t = clamp((minutes - duskStart) / (duskEnd - duskStart), 0, 1);
      sunOpacity = lerp(1, 0.15, t);
      moonOpacity = lerp(0, 0.85, t);
      starsOpacity = lerp(0, 0.55, t);
      skyProgress = lerp(0.72, 0.92, t);
      break;
    }
    case "night": {
      sunOpacity = 0;
      moonOpacity = 1;
      starsOpacity = 0.75;
      skyProgress = minutes < dawnStart ? 0.95 : 0.08;
      break;
    }
  }

  return {
    phase,
    greeting: getGreeting(phase),
    label: getPhaseLabel(phase),
    sunOpacity,
    moonOpacity,
    starsOpacity,
    skyProgress,
  };
}

export function formatCurrentTime(now: Date): string {
  return now.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
