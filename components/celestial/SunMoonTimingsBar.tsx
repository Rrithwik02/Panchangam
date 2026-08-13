"use client";

import { Sunrise, Sunset, Sun, Moon } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { useTimeOfDayOptional } from "@/components/celestial/TimeOfDayProvider";
import { todaysPanchangam } from "@/lib/mock-panchangam";

export function SunMoonTimingsBar() {
  const timeOfDay = useTimeOfDayOptional();
  const data = todaysPanchangam;
  const phase = timeOfDay?.info.phase ?? "day";
  const currentTime = timeOfDay?.currentTime ?? "--:--";

  const PhaseIcon =
    phase === "night" ? Moon : phase === "dusk" ? Sunset : Sun;

  return (
    <AnimatedSection className="mx-auto mt-10 max-w-3xl">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-sm">
        <div className="celestial-timing-track absolute inset-x-0 top-0 h-full opacity-60" aria-hidden="true" />
        <div className="relative grid grid-cols-3 divide-x divide-border">
          <div className="flex flex-col items-center gap-1 px-4 py-5 text-center sm:px-6">
            <Sunrise className="h-5 w-5 text-accent" aria-hidden="true" />
            <span className="text-metadata uppercase tracking-wider text-muted">
              Sunrise
            </span>
            <span className="text-lg font-semibold tabular-nums">{data.sunrise}</span>
          </div>

          <div className="flex flex-col items-center gap-1 px-4 py-5 text-center sm:px-6">
            <PhaseIcon className="h-5 w-5 text-accent" aria-hidden="true" />
            <span className="text-metadata uppercase tracking-wider text-muted">
              Now
            </span>
            <span className="text-lg font-semibold tabular-nums">{currentTime}</span>
            <span className="text-xs text-muted capitalize">
              {timeOfDay?.info.label ?? "Daytime"}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1 px-4 py-5 text-center sm:px-6">
            <Sunset className="h-5 w-5 text-accent" aria-hidden="true" />
            <span className="text-metadata uppercase tracking-wider text-muted">
              Sunset
            </span>
            <span className="text-lg font-semibold tabular-nums">{data.sunset}</span>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
