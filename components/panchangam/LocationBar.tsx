"use client";

import { MapPin, RefreshCw } from "lucide-react";
import { formatLocationLabel } from "@/lib/location";
import type { LocationParameters } from "@/lib/types/panchangam";

interface LocationBarProps {
  location?: LocationParameters;
  resolvedLabel?: string;
  onRetryLocation?: () => void;
  isLocating?: boolean;
}

export function LocationBar({
  location,
  resolvedLabel,
  onRetryLocation,
  isLocating = false,
}: LocationBarProps) {
  const label = resolvedLabel || (location ? formatLocationLabel(location) : "Hyderabad · Asia/Kolkata");

  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-border/80 bg-card/70 px-3.5 py-1.5 text-xs text-muted backdrop-blur-sm">
      <MapPin className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
      <span>
        Panchangam for <strong className="font-medium text-foreground">{label}</strong>
      </span>
      {onRetryLocation && (
        <button
          onClick={onRetryLocation}
          disabled={isLocating}
          className="ml-1 transition-colors hover:text-foreground disabled:opacity-50"
          title="Detect location"
          aria-label="Detect location"
        >
          <RefreshCw className={`h-3 w-3 ${isLocating ? "animate-spin text-accent" : ""}`} />
        </button>
      )}
    </div>
  );
}
