"use client";

import { Moon, Sun, Sunrise, Sunset } from "lucide-react";
import { useTimeOfDayOptional } from "./TimeOfDayProvider";
import { cn } from "@/lib/utils";

export function DayPhaseBadge({ className }: { className?: string }) {
  const timeOfDay = useTimeOfDayOptional();
  if (!timeOfDay) return null;

  const { info, currentTime, sunrise, sunset } = timeOfDay;
  const Icon = info.phase === "night" || info.phase === "dusk" ? Moon : Sun;

  return (
    <div
      className={cn(
        "hidden items-center gap-3 rounded-full border border-border/80 bg-card/60 px-3 py-1.5 text-metadata backdrop-blur-sm lg:flex",
        className
      )}
      aria-label={`Current time ${currentTime}, ${info.label}`}
    >
      <Icon className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
      <span className="font-medium text-foreground">{currentTime}</span>
      <span className="h-3 w-px bg-border" aria-hidden="true" />
      <span className="flex items-center gap-1 text-muted">
        <Sunrise className="h-3 w-3" aria-hidden="true" />
        {sunrise}
      </span>
      <span className="flex items-center gap-1 text-muted">
        <Sunset className="h-3 w-3" aria-hidden="true" />
        {sunset}
      </span>
    </div>
  );
}
