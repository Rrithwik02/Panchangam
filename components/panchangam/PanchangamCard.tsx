"use client";

import type { PanchangamDay } from "@/lib/types/panchangam";
import { cn } from "@/lib/utils";
import { useTimeOfDayOptional } from "@/components/celestial/TimeOfDayProvider";
import { DayElementsGroup } from "./DayElementsGroup";
import { FestivalsList } from "./FestivalsList";
import { LocationBadge } from "./LocationBadge";
import { SpecialTimingsGroup } from "./SpecialTimingsGroup";
import { SunMoonGroup } from "./SunMoonGroup";
import { TimingsGroup } from "./TimingsGroup";

interface PanchangamCardProps {
  data: PanchangamDay;
  variant?: "hero" | "full" | "compact";
  className?: string;
}

function GroupCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function PanchangamCard({
  data,
  variant = "full",
  className,
}: PanchangamCardProps) {
  const timeOfDay = useTimeOfDayOptional();
  const greeting = timeOfDay?.info.greeting ?? "Good Morning";

  if (variant === "hero") {
    return (
      <div
        className={cn(
          "card-glow card-glass w-full max-w-md rounded-2xl border border-border/80 p-6",
          className
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-accent">
              Today&apos;s Panchangam
            </p>
            <p className="mt-1 text-lg font-semibold">{data.dateLabel}</p>
            <p className="text-sm text-muted">{data.vara}</p>
          </div>
          <LocationBadge location={data.location} />
        </div>
        <DayElementsGroup data={data} compact />
        <div className="mt-4 border-t border-border pt-4">
          <SunMoonGroup data={data} compact />
        </div>
        <div className="mt-4 border-t border-border pt-4">
          <TimingsGroup data={data} />
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm",
          className
        )}
      >
        <p className="text-sm text-white/60">{greeting}</p>
        <p className="mt-1 text-xl font-semibold text-white">
          {data.vara} · {data.dateLabel}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-white/50">Tithi</p>
            <p className="font-medium text-white">{data.tithi}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">Nakshatra</p>
            <p className="font-medium text-white">{data.nakshatra}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">Sunrise</p>
            <p className="font-medium text-white">{data.sunrise}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">Rahu Kalam</p>
            <p className="font-medium text-white">
              {data.rahuKalam.start} – {data.rahuKalam.end}
            </p>
          </div>
        </div>
        {data.festivals.length > 0 && (
          <div className="mt-6 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3">
            <p className="text-xs text-accent">Today&apos;s Festival</p>
            <p className="mt-1 font-medium text-white">{data.festivals[0]}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">{data.dateLabel}</h2>
          <p className="text-muted">{data.vara}</p>
        </div>
        <LocationBadge location={data.location} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GroupCard title="Day">
          <DayElementsGroup data={data} />
        </GroupCard>
        <GroupCard title="Sun & Moon">
          <SunMoonGroup data={data} />
        </GroupCard>
        <GroupCard title="Important Timings">
          <TimingsGroup data={data} />
        </GroupCard>
        <GroupCard title="Special Timings">
          <SpecialTimingsGroup data={data} />
        </GroupCard>
        <GroupCard title="Today">
          <FestivalsList data={data} />
        </GroupCard>
      </div>
    </div>
  );
}
