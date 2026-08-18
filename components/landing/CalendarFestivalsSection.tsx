"use client";

import { PanchangamCalendarView } from "@/components/calendar/PanchangamCalendarView";
import type { PanchangamDay, LocationParameters } from "@/lib/types/panchangam";

interface CalendarFestivalsSectionProps {
  initialDay: PanchangamDay;
  location?: LocationParameters;
}

export function CalendarFestivalsSection({
  initialDay,
  location,
}: CalendarFestivalsSectionProps) {
  return (
    <section id="calendar-festivals" className="py-16 sm:py-24 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Monthly Explorer
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-title font-semibold text-foreground">
            Calendar & Festivals
          </h2>
          <p className="text-sm text-muted">
            Explore Tithi, Nakshatra, and festival observances across days and months using real precomputed data.
          </p>
        </div>

        {/* Calendar View Component */}
        <PanchangamCalendarView initialDay={initialDay} location={location} />
      </div>
    </section>
  );
}
