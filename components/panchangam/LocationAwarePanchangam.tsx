"use client";

import { useEffect, useState } from "react";
import { MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PanchangamCard } from "@/components/panchangam/PanchangamCard";
import {
  buildLocationSearchParams,
  formatLocationLabel,
  getBrowserTimezone,
} from "@/lib/location";
import type { PanchangamDay, PanchangamApiSuccessResponse } from "@/lib/types/panchangam";

type LocationStatus = "idle" | "loading" | "resolved" | "denied" | "unavailable" | "error";

interface LocationAwarePanchangamProps {
  data: PanchangamDay;
  className?: string;
}

export function LocationAwarePanchangam({
  data,
  className,
}: LocationAwarePanchangamProps) {
  const [resolvedData, setResolvedData] = useState<PanchangamDay>(data);
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [message, setMessage] = useState<string>("Detecting your browser timezone.");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timezone = getBrowserTimezone();

    async function requestPanchangam(
      latitude: number | null,
      longitude: number | null
    ) {
      const params = buildLocationSearchParams({
        date: data.date,
        latitude,
        longitude,
        timezone,
      });

      const response = await fetch(`/api/v1/panchangam/date?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as PanchangamApiSuccessResponse;

      if (!payload.success) {
        throw new Error("Unexpected API error response");
      }

      return payload;
    }

    async function resolveLocation() {
      if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
        try {
          setStatus("unavailable");
          setMessage(
            `Browser geolocation is unavailable. Showing reference Panchangam for ${timezone}.`
          );
          const payload = await requestPanchangam(null, null);
          if (!cancelled) {
            setResolvedData(payload.data);
          }
        } catch (error) {
          if (!cancelled) {
            setStatus("error");
            setMessage(
              error instanceof Error ? error.message : "Unable to load Panchangam."
            );
          }
        }
        return;
      }

      setStatus("loading");
      setMessage("Requesting browser location permission.");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const payload = await requestPanchangam(
              position.coords.latitude,
              position.coords.longitude
            );

            if (cancelled) {
              return;
            }

            setResolvedData(payload.data);
            setStatus("resolved");
            setMessage(`Using ${formatLocationLabel(payload.meta.location)}.`);
          } catch (error) {
            if (cancelled) {
              return;
            }

            setStatus("error");
            setMessage(
              error instanceof Error ? error.message : "Unable to load Panchangam."
            );
          }
        },
        async (error) => {
          try {
            setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "error");
            setMessage(
              error.code === error.PERMISSION_DENIED
                ? `Location permission denied. Showing reference Panchangam for ${timezone}.`
                : `Location lookup failed. Showing reference Panchangam for ${timezone}.`
            );
            const payload = await requestPanchangam(null, null);
            if (!cancelled) {
              setResolvedData(payload.data);
            }
          } catch (requestError) {
            if (!cancelled) {
              setStatus("error");
              setMessage(
                requestError instanceof Error
                  ? requestError.message
                  : "Unable to load Panchangam."
              );
            }
          }
        }
      );
    }

    resolveLocation();

    return () => {
      cancelled = true;
    };
  }, [data.date, retryKey]);

  const retry = () => {
    setRetryKey((current) => current + 1);
  };

  return (
    <div className={className}>
      <div className="mb-4 rounded-2xl border border-border bg-card-muted p-4">
        <div className="flex items-center gap-2 text-accent">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-wider">
            Location-aware mode
          </p>
        </div>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <p className="mt-1 text-xs text-muted/80">
          This build sends latitude, longitude, and timezone to
          `/api/v1/panchangam/date`, but the current dataset is still reference
          Panchangam data rather than a live astronomical engine.
        </p>
        {(status === "denied" || status === "error" || status === "unavailable") && (
          <div className="mt-3">
            <Button onClick={retry} variant="secondary" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Retry location
            </Button>
          </div>
        )}
      </div>

      <PanchangamCard data={resolvedData} variant="full" />
    </div>
  );
}
