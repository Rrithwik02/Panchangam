"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TimeOfDayProviderBase } from "@/components/celestial/TimeOfDayProvider";
import { HeroSection } from "@/components/landing/HeroSection";
import { TodayPanchangamSection } from "@/components/landing/TodayPanchangamSection";
import { SunMoonSection } from "@/components/landing/SunMoonSection";
import { ImportantTimingsSection } from "@/components/landing/ImportantTimingsSection";
import { ProductTiersSection } from "@/components/landing/ProductTiersSection";
import {
  buildLocationSearchParams,
  fetchCityFromCoordinates,
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
  const [cityName, setCityName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) return;

    const timezone = getBrowserTimezone();

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          // Simultaneously fetch reverse geocoded city name and Panchangam API data
          const [cityResolved, apiRes] = await Promise.all([
            fetchCityFromCoordinates(lat, lon),
            fetch(
              `/api/v1/panchangam/date?${buildLocationSearchParams({
                date: initialDay.date,
                latitude: lat,
                longitude: lon,
                timezone,
              }).toString()}`
            ),
          ]);

          if (cityResolved) {
            setCityName(cityResolved);
          }

          if (apiRes.ok) {
            const payload = (await apiRes.json()) as PanchangamApiSuccessResponse;
            if (payload.success) {
              setDayData(payload.data);
              setLocation(payload.meta.location);
            }
          }
        } catch {
          // Fall back to initial reference location
        }
      },
      () => {},
      { timeout: 8000 }
    );
  }, [initialDay.date]);

  return (
    <TimeOfDayProviderBase data={dayData}>
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
        <Navbar cityName={cityName} />

        <main id="main-content" className="flex-1">
          {/* Section 1: Hero */}
          <HeroSection data={dayData} location={location} cityName={cityName} />

          {/* Section 2: Today's Panchangam */}
          <TodayPanchangamSection data={dayData} location={location} cityName={cityName} />

          {/* Section 3: Sun & Moon */}
          <SunMoonSection data={dayData} />

          {/* Section 4: Important Timings */}
          <ImportantTimingsSection data={dayData} />

          {/* Section 5: Basic / Premium / API Product Tiers */}
          <ProductTiersSection />
        </main>

        {/* Section 6: Footer */}
        <Footer />
      </div>
    </TimeOfDayProviderBase>
  );
}
