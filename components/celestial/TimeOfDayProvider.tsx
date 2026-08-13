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
import {
  type DayPhaseInfo,
  formatCurrentTime,
  getDayPhaseInfo,
} from "@/lib/time-of-day";

interface TimeOfDayContextValue {
  info: DayPhaseInfo;
  currentTime: string;
  sunrise: string;
  sunset: string;
}

const TimeOfDayContext = createContext<TimeOfDayContextValue | null>(null);

export function TimeOfDayProvider({ children }: { children: React.ReactNode }) {
  const sunrise = todaysPanchangam.sunrise;
  const sunset = todaysPanchangam.sunset;

  const [now, setNow] = useState<Date | null>(null);

  const tick = useCallback(() => setNow(new Date()), []);

  useEffect(() => {
    tick();
    const interval = window.setInterval(tick, 60_000);
    return () => window.clearInterval(interval);
  }, [tick]);

  const info = useMemo(
    () => getDayPhaseInfo(now ?? new Date(), sunrise, sunset),
    [now, sunrise, sunset]
  );

  const currentTime = useMemo(
    () => (now ? formatCurrentTime(now) : "--:--"),
    [now]
  );

  useEffect(() => {
    if (!now) return;

    const root = document.documentElement;
    root.style.setProperty("--phase-sun-opacity", String(info.sunOpacity));
    root.style.setProperty("--phase-moon-opacity", String(info.moonOpacity));
    root.style.setProperty("--phase-stars-opacity", String(info.starsOpacity));
    root.style.setProperty("--sky-progress", String(info.skyProgress));
    root.dataset.dayPhase = info.phase;
  }, [info, now]);

  const value = useMemo(
    () => ({ info, currentTime, sunrise, sunset }),
    [info, currentTime, sunrise, sunset]
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
