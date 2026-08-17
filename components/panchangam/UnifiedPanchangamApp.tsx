"use client";

import { useEffect, useState } from "react";
import { Navbar, type NavTab } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TimeOfDayProviderBase } from "@/components/celestial/TimeOfDayProvider";
import { TodayPanchangamView } from "@/components/panchangam/TodayPanchangamView";
import { PanchangamCalendarView } from "@/components/calendar/PanchangamCalendarView";
import { ExplorePanchangamView } from "@/components/explore/ExplorePanchangamView";
import { PremiumPanchangamView } from "@/components/premium/PremiumPanchangamView";
import {
  buildLocationSearchParams,
  formatLocationLabel,
  getBrowserTimezone,
} from "@/lib/location";
import type { PanchangamDay, LocationParameters, PanchangamApiSuccessResponse } from "@/lib/types/panchangam";

interface UnifiedPanchangamAppProps {
  initialDay: PanchangamDay;
  initialLocation: LocationParameters;
}

export function UnifiedPanchangamApp({
  initialDay,
  initialLocation,
}: UnifiedPanchangamAppProps) {
  const [activeTab, setActiveTab] = useState<NavTab>("today");
  const [dayData, setDayData] = useState<PanchangamDay>(initialDay);
  const [location, setLocation] = useState<LocationParameters>(initialLocation);
  const [resolvedLabel, setResolvedLabel] = useState<string>("Hyderabad · Asia/Kolkata");
  const [isLocating, setIsLocating] = useState(false);

  // Request client location on mount or retry
  const resolveClientLocation = async () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) return;

    const timezone = getBrowserTimezone();
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const params = buildLocationSearchParams({
            date: initialDay.date,
            latitude: lat,
            longitude: lon,
            timezone,
          });

          const res = await fetch(`/api/v1/panchangam/date?${params.toString()}`);
          if (res.ok) {
            const payload = (await res.json()) as PanchangamApiSuccessResponse;
            if (payload.success) {
              setDayData(payload.data);
              setLocation(payload.meta.location);
              setResolvedLabel(formatLocationLabel(payload.meta.location));
            }
          }
        } catch {
          // Keep current reference location
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  useEffect(() => {
    resolveClientLocation();
  }, []);

  return (
    <TimeOfDayProviderBase data={dayData}>
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

        <main id="main-content" className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {activeTab === "today" && (
            <TodayPanchangamView
              data={dayData}
              location={location}
              onRetryLocation={resolveClientLocation}
              isLocating={isLocating}
            />
          )}

          {activeTab === "calendar" && (
            <PanchangamCalendarView
              initialDay={dayData}
              location={location}
            />
          )}

          {activeTab === "explore" && <ExplorePanchangamView />}

          {activeTab === "premium" && <PremiumPanchangamView />}
        </main>

        <Footer />
      </div>
    </TimeOfDayProviderBase>
  );
}
