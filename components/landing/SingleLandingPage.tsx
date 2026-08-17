"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TimeOfDayProviderBase } from "@/components/celestial/TimeOfDayProvider";
import { HeroSection } from "@/components/landing/HeroSection";
import { TodayPanchangamSection } from "@/components/landing/TodayPanchangamSection";
import { DailyTimingsSection } from "@/components/landing/DailyTimingsSection";
import { TithiNakshatraSection } from "@/components/landing/TithiNakshatraSection";
import { CalendarFestivalsSection } from "@/components/landing/CalendarFestivalsSection";
import { ExploreSection } from "@/components/landing/ExploreSection";
import { PremiumSection } from "@/components/landing/PremiumSection";
import {
  buildLocationSearchParams,
  getBrowserTimezone,
} from "@/lib/location";
import type { PanchangamDay, LocationParameters, PanchangamApiSuccessResponse } from "@/lib/types/panchangam";

interface SingleLandingPageProps {
  initialDay: PanchangamDay;
  initialLocation: LocationParameters;
}

export function SingleLandingPage({
  initialDay,
  initialLocation,
}: SingleLandingPageProps) {
  const [dayData, setDayData] = useState<PanchangamDay>(initialDay);
  const [location, setLocation] = useState<LocationParameters>(initialLocation);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) return;

    const timezone = getBrowserTimezone();
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
            }
          }
        } catch {
          // Keep current reference location
        }
      },
      () => {},
      { timeout: 8000 }
    );
  }, [initialDay.date]);

  return (
    <TimeOfDayProviderBase data={dayData}>
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
        <Navbar />

        <main id="main-content" className="flex-1">
          {/* Section 1: Hero */}
          <HeroSection data={dayData} location={location} />

          {/* Section 2: Today's Panchangam */}
          <TodayPanchangamSection data={dayData} />

          {/* Section 3: Sun & Moon / Daily Timings */}
          <DailyTimingsSection data={dayData} />

          {/* Section 4: Tithi & Nakshatra */}
          <TithiNakshatraSection data={dayData} />

          {/* Section 5: Calendar & Festivals */}
          <CalendarFestivalsSection initialDay={dayData} location={location} />

          {/* Section 6: Explore Panchangam */}
          <ExploreSection />

          {/* Section 7: Premium */}
          <PremiumSection />
        </main>

        <Footer />
      </div>
    </TimeOfDayProviderBase>
  );
}
