"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { todaysPanchangam } from "@/lib/mock-panchangam";
import { getMoonPhaseFromTithi, type MoonPhaseInfo } from "@/lib/moon-phase";
import {
  type DayPhaseInfo,
  formatCurrentTime,
  getDayPhaseInfo,
} from "@/lib/time-of-day";

interface TimeOfDayContextValue {
  info: DayPhaseInfo;
  moonPhase: MoonPhaseInfo;
  currentTime: string;
  sunrise: string;
  sunset: string;
}

const TimeOfDayContext = createContext<TimeOfDayContextValue | null>(null);

export function TimeOfDayProvider({ children }: { children: React.ReactNode }) {
  const { sunrise, sunset, moonrise, moonset, tithi, paksha } = todaysPanchangam;

  const moonPhase = useMemo(
    () => getMoonPhaseFromTithi(tithi, paksha),
    [tithi, paksha]
  );

  const [now, setNow] = useState<Date>(() => new Date());

  const tick = useCallback(() => setNow(new Date()), []);

  useEffect(() => {
    const interval = window.setInterval(tick, 60_000);
    return () => window.clearInterval(interval);
  }, [tick]);

  const info = useMemo(
    () =>
      getDayPhaseInfo(
        now,
        sunrise,
        sunset,
        moonrise,
        moonset,
        moonPhase
      ),
    [now, sunrise, sunset, moonrise, moonset, moonPhase]
  );

  const currentTime = useMemo(
    () => formatCurrentTime(now),
    [now]
  );

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--phase-sun-opacity", String(info.sunOpacity));
    root.style.setProperty("--phase-moon-opacity", String(info.moonOpacity));
    root.style.setProperty("--phase-stars-opacity", String(info.starsOpacity));
    root.style.setProperty("--sky-progress", String(info.skyProgress));
    root.dataset.dayPhase = info.phase;
    root.dataset.theme = info.theme;
    root.style.setProperty("--sun-x", `${(info.sun.x / 800) * 100}%`);
    root.style.setProperty("--sun-y", `${(info.sun.y / 500) * 100}%`);
    root.style.setProperty("--moon-x", `${(info.moon.x / 800) * 100}%`);
    root.style.setProperty("--moon-y", `${(info.moon.y / 500) * 100}%`);
  }, [info, now]);

  const value = useMemo(
    () => ({ info, moonPhase, currentTime, sunrise, sunset }),
    [info, moonPhase, currentTime, sunrise, sunset]
  );

  return (
    <TimeOfDayContext.Provider value={value}>{children}</TimeOfDayContext.Provider>
  );
}

export function useTimeOfDay() {
  const context = useContext(TimeOfDayContext);
  if (!context) {
    throw new Error("useTimeOfDay must be used within TimeOfDayProvider");
  }
  return context;
}

export function useTimeOfDayOptional() {
  return useContext(TimeOfDayContext);
}
