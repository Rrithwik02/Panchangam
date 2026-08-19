"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import type { PanchangamDay, LocationParameters } from "@/lib/types/panchangam";
import { TodayPanchangamView } from "@/components/panchangam/TodayPanchangamView";

interface PanchangamCalendarViewProps {
  initialDay: PanchangamDay;
  location?: LocationParameters;
}

export function PanchangamCalendarView({
  initialDay,
  location,
}: PanchangamCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string>(initialDay.date);
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // August
  const [selectedDayData, setSelectedDayData] = useState<PanchangamDay>(initialDay);
  const [isLoading, setIsLoading] = useState(false);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Generate 31 days grid for the month
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 is Sunday

  const handleSelectDay = async (dayNum: number) => {
    const formattedMonth = String(currentMonth).padStart(2, "0");
    const formattedDay = String(dayNum).padStart(2, "0");
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

    setSelectedDate(dateStr);
    setIsLoading(true);

    try {
      const timezone = location?.timezone || "Asia/Kolkata";
      const res = await fetch(
        `/api/v1/panchangam/date?date=${dateStr}&timezone=${encodeURIComponent(timezone)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const payload = await res.json();
        if (payload.success && payload.data) {
          setSelectedDayData(payload.data);
        }
      }
    } catch {
      // Keep reference day if fetch fails
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Calendar Header & Controls */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-serif-title font-semibold">
                {monthNames[currentMonth - 1]} {currentYear}
              </h2>
              <p className="text-xs text-muted">Panchangam Calendar View</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card hover:bg-card-muted transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft className="h-4 w-4 text-muted" />
            </button>
            <span className="px-3 text-sm font-medium text-muted">
              {monthNames[currentMonth - 1]}
            </span>
            <button
              onClick={handleNextMonth}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card hover:bg-card-muted transition-colors"
              aria-label="Next Month"
            >
              <ChevronRight className="h-4 w-4 text-muted" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="mt-6 grid grid-cols-7 text-center text-xs font-semibold text-muted uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Days Grid */}
        <div className="mt-3 grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Empty offset slots */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`offset-${i}`} className="h-20 sm:h-24 rounded-xl border border-transparent" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const formattedMonth = String(currentMonth).padStart(2, "0");
            const formattedDay = String(dayNum).padStart(2, "0");
            const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
            const isSelected = selectedDate === dateStr;
            const isReferenceDay = dayNum === 13 && currentMonth === 8 && currentYear === 2026;

            return (
              <button
                key={dateStr}
                onClick={() => handleSelectDay(dayNum)}
                className={`flex flex-col justify-between p-2 rounded-xl text-left transition-all border ${
                  isSelected
                    ? "border-accent bg-accent/10 shadow-sm ring-1 ring-accent"
                    : "border-border/60 bg-card hover:border-accent/40 hover:bg-card-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${isSelected ? "text-accent" : "text-foreground"}`}>
                    {dayNum}
                  </span>
                  {isReferenceDay && (
                    <span className="flex h-2 w-2 rounded-full bg-accent" title="Today" />
                  )}
                </div>

                <div className="mt-1 space-y-0.5">
                  <p className="text-[10px] font-medium text-muted line-clamp-1">
                    {isReferenceDay ? initialDay.tithi : "Shukla Tithi"}
                  </p>
                  <p className="text-[9px] text-muted/70 line-clamp-1">
                    {isReferenceDay ? initialDay.nakshatra : "Nakshatra"}
                  </p>
                </div>

                {isReferenceDay && initialDay.festivals.length > 0 && (
                  <div className="mt-1 flex items-center gap-1 text-[9px] font-medium text-accent">
                    <Sparkles className="h-2.5 w-2.5 shrink-0" />
                    <span className="truncate">{initialDay.festivals[0]}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Panchangam Detail */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/70 pb-3">
          <h3 className="text-xl font-serif-title font-semibold">
            Panchangam Details for {selectedDate}
          </h3>
          {isLoading && <span className="text-xs text-accent animate-pulse">Loading Panchangam...</span>}
        </div>

        <TodayPanchangamView data={selectedDayData} location={location} />
      </div>
    </div>
  );
}
