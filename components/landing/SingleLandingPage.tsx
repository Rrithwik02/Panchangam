"use client";

import { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TimeOfDayProviderBase } from "@/components/celestial/TimeOfDayProvider";
import { HeroSection } from "@/components/landing/HeroSection";
import { TodayPanchangamSection } from "@/components/landing/TodayPanchangamSection";
import { SunMoonSection } from "@/components/landing/SunMoonSection";
import { ImportantTimingsSection } from "@/components/landing/ImportantTimingsSection";
import { ProductTiersSection } from "@/components/landing/ProductTiersSection";
import {
  fetchCityFromCoordinates,
  getBrowserTimezone,
} from "@/lib/location";
import type {
  PanchangamDay,
  PanchangamPreviewDay,
  LocationParameters,
  PanchangamApiSuccessResponse,
  PanchangamApiPreviewResponse,
} from "@/lib/types/panchangam";

interface SingleLandingPageProps {
  initialDay: PanchangamDay;
  initialLocation: LocationParameters;
}

export function SingleLandingPage({
  initialDay,
  initialLocation,
}: SingleLandingPageProps) {
  const [activeMode, setActiveMode] = useState<"today" | "yesterday" | "tomorrow">("today");
  const [dayData, setDayData] = useState<PanchangamDay | PanchangamPreviewDay>(initialDay);
  const [location, setLocation] = useState<LocationParameters>(initialLocation);
  const [cityName, setCityName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch relative Panchangam data from API (Today, Yesterday, Tomorrow)
  const fetchRelativeData = useCallback(
    async (mode: "today" | "yesterday" | "tomorrow", loc: LocationParameters) => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams({ timezone: loc.timezone });

        if (loc.latitude !== null && loc.longitude !== null) {
          query.set("latitude", loc.latitude.toString());
          query.set("longitude", loc.longitude.toString());
        }

        const endpoint = `/api/v1/panchangam/${mode}?${query}`;
        const res = await fetch(endpoint, { cache: "no-store" });

        if (res.ok) {
          const payload = (await res.json()) as
            | PanchangamApiSuccessResponse
            | PanchangamApiPreviewResponse;
          if (payload.success) {
            setDayData(payload.data);
            setLocation(payload.meta.location);
          }
        }
      } catch {
        // Keep existing payload on network failure
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Handle Mode Change (Yesterday | Today | Tomorrow)
  const handleModeChange = (mode: "today" | "yesterday" | "tomorrow") => {
    setActiveMode(mode);
    fetchRelativeData(mode, location);
  };

  // Device Location Resolution & Initial Fetch
  useEffect(() => {
    const timezone = getBrowserTimezone();
    const timezoneOnlyLocation: LocationParameters = {
      latitude: null,
      longitude: null,
      timezone,
    };

    const initialFetchTimeout = window.setTimeout(() => {
      void fetchRelativeData("today", timezoneOnlyLocation);
    }, 0);

    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const userLocation: LocationParameters = { latitude: lat, longitude: lon, timezone };

            // Fetch reverse geocoded city name & Today API payload
            const [cityResolved] = await Promise.all([
              fetchCityFromCoordinates(lat, lon),
              fetchRelativeData("today", userLocation),
            ]);

            if (cityResolved) {
              setCityName(cityResolved);
            }
          } catch {
            // Fall back gracefully
          }
        },
        () => {},
        { timeout: 8000 }
      );
    }

    return () => {
      window.clearTimeout(initialFetchTimeout);
    };
  }, [fetchRelativeData]);

  // Fall back to reference day for Three.js celestial provider if in preview mode
  const providerData: PanchangamDay =
    "access" in dayData && dayData.access === "preview"
      ? initialDay
      : (dayData as PanchangamDay);

  return (
    <TimeOfDayProviderBase data={providerData}>
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
        <Navbar cityName={cityName} />

        <main id="main-content" className="flex-1">
          {/* Section 1: Hero */}
          <HeroSection data={providerData} location={location} cityName={cityName} />

          {/* Section 2: Today's Panchangam (with Yesterday/Today/Tomorrow Switcher) */}
          <TodayPanchangamSection
            data={dayData}
            location={location}
            cityName={cityName}
            activeMode={activeMode}
            onModeChange={handleModeChange}
            isLoading={isLoading}
          />

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
