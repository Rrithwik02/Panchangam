import { buildPeriodSegments } from "@/lib/panchangam-timeline";
import type { PanchangamPeriodEntry } from "@/lib/types/panchangam";

interface PeriodGroupProps {
  /** Singular label, e.g. "Tithi". Pluralized automatically when there is more than one entry. */
  label: string;
  entries: PanchangamPeriodEntry[];
  /** Controls type scale: "primary" for Tithi/Nakshatra, "secondary" for Yoga/Karana. */
  tier?: "primary" | "secondary";
  accent?: "accent" | "gold";
}

// "5:54 PM" -> "until 5:54 PM"; non-clock labels (e.g. "Spans to next day") pass through unchanged.
function formatPeriodEndLabel(endTime: string): string {
  return /^\d/.test(endTime) ? `until ${endTime}` : endTime;
}

export function PeriodGroup({ label, entries, tier = "primary", accent = "accent" }: PeriodGroupProps) {
  if (entries.length === 0) return null;

  const isPrimary = tier === "primary";
  const nameSize = isPrimary
    ? "text-2xl sm:text-3xl lg:text-[2rem]"
    : "text-lg sm:text-xl";
  const accentTextClass = accent === "accent" ? "text-accent" : "text-gold";

  // The bar reads as "current period" (orange) vs. "rest of the day" (grey), so only the
  // first (currently active) entry's share is ever filled — clamped so neither color can
  // visually disappear at the extremes, without distorting the underlying proportion.
  const rawFilledPercent = entries.length > 1 ? buildPeriodSegments(entries)[0].widthPercent : null;
  const filledPercent = rawFilledPercent === null ? null : Math.min(96, Math.max(4, rawFilledPercent));

  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted">
        {entries.length > 1 ? `${label}s` : label}
      </span>

      {filledPercent !== null && (
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted/25"
          role="img"
          aria-label={`${label} periods across the day`}
        >
          <div className="h-full rounded-full bg-accent" style={{ width: `${filledPercent}%` }} />
        </div>
      )}

      <div className={entries.length > 1 ? "grid gap-3 lg:grid-cols-2" : undefined}>
        {entries.map((entry, index) => (
          <div key={`${entry.name}-${index}`} className="min-w-0">
            <p
              className={`${nameSize} font-serif-title font-bold text-foreground leading-tight break-words`}
            >
              {entry.name}
            </p>
            <p className={`text-xs font-medium ${accentTextClass}`}>
              {[
                entry.paksha ? `${entry.paksha} Paksha` : null,
                entry.endTime
                  ? formatPeriodEndLabel(entry.endTime)
                  : entries.length === 1
                    ? isPrimary
                      ? "Ruling for the full day"
                      : null
                    : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
