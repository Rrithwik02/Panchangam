"use client";

import { Moon, Sun, Sunrise, Sunset } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useTimeOfDayOptional } from "@/components/celestial/TimeOfDayProvider";
import type { PanchangamDay } from "@/lib/types/panchangam";

export function SunMoonTimingsBar({ data }: { data: PanchangamDay }) {
  const timeOfDay = useTimeOfDayOptional();
  const phase = timeOfDay?.info.phase ?? "day";
  const currentTime = timeOfDay?.currentTime ?? "--:--";
  const moonPhase = timeOfDay?.moonPhase;

  const PhaseIcon =
    phase === "night" ? Moon : phase === "dusk" ? Sunset : Sun;

  const moonPhaseLabel = moonPhase
    ? moonPhase.illumination <= 0.02
      ? "Amavasya — no moon"
      : moonPhase.illumination >= 0.98
        ? "Pournami — full moon"
        : `${Math.round(moonPhase.illumination * 100)}% illuminated`
    : null;

  return (
    <ScrollReveal className="mx-auto mt-10 max-w-3xl">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-sm transition-colors duration-[1500ms]">
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
            {moonPhaseLabel && (
              <span className="mt-0.5 text-xs text-gold">{moonPhaseLabel}</span>
            )}
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
    </ScrollReveal>
  );
}
