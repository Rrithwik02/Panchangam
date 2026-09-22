"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Guards against out-of-order responses: only the response matching the
  // most recently issued request is allowed to update state. Without this,
  // an older in-flight request (e.g. Yesterday) that resolves after a newer
  // one (e.g. Today) would overwrite the UI with stale data.
  const latestRequestIdRef = useRef(0);

  // Fetch relative Panchangam data from API (Today, Yesterday, Tomorrow)
  const fetchRelativeData = useCallback(
    async (mode: "today" | "yesterday" | "tomorrow", loc: LocationParameters) => {
      const requestId = ++latestRequestIdRef.current;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const query = new URLSearchParams({ timezone: loc.timezone });

        if (loc.latitude !== null && loc.longitude !== null) {
          query.set("latitude", loc.latitude.toString());
          query.set("longitude", loc.longitude.toString());
        }

        const endpoint = `/api/v1/panchangam/${mode}?${query}`;
        const res = await fetch(endpoint, { cache: "no-store" });

        if (requestId !== latestRequestIdRef.current) return; // superseded by a newer request

        if (res.ok) {
          const payload = (await res.json()) as
            | PanchangamApiSuccessResponse
            | PanchangamApiPreviewResponse;
          if (requestId !== latestRequestIdRef.current) return;
          if (payload.success) {
            setDayData(payload.data);
            setLocation(payload.meta.location);
            setErrorMessage(null);
          } else {
            setErrorMessage("Unable to load Panchangam data for the selected date.");
          }
        } else {
          const errPayload = await res.json().catch(() => null);
          if (requestId !== latestRequestIdRef.current) return;
          const msg =
            errPayload?.error?.message ||
            `Live Panchangam data unavailable (${res.status}).`;
          setErrorMessage(msg);
        }
      } catch (err) {
        if (requestId !== latestRequestIdRef.current) return;
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Network error: Unable to connect to Panchangam service."
        );
      } finally {
        if (requestId === latestRequestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  // Handle Mode Change (Yesterday | Today | Tomorrow)
  const handleModeChange = (mode: "today" | "yesterday" | "tomorrow") => {
    setActiveMode(mode);
    fetchRelativeData(mode, location);
  };

  // Device Location Resolution & Initial Fetch (mount only — must not re-run
  // on every mode switch, otherwise it re-triggers geolocation and fires a
  // second, competing fetch for whatever mode is active at that moment).
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

            // Fetch reverse geocoded city name & API payload for the initial mode
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally mount-only
  }, []);

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
            errorMessage={errorMessage}
            onRetry={() => fetchRelativeData(activeMode, location)}
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
