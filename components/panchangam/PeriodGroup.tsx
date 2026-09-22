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

const SEGMENT_COLORS = ["bg-accent", "bg-gold", "bg-accent/55", "bg-gold/55", "bg-accent/30", "bg-gold/30"];

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
  const segments = entries.length > 1 ? buildPeriodSegments(entries) : null;

  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted">
        {entries.length > 1 ? `${label}s` : label}
      </span>

      {segments && (
        <div
          className="flex h-1.5 w-full overflow-hidden rounded-full bg-border/50"
          role="img"
          aria-label={`${label} periods across the day`}
        >
          {segments.map((segment, index) => (
            <div
              key={`${segment.entry.name}-${index}`}
              className={`${SEGMENT_COLORS[index % SEGMENT_COLORS.length]} h-full first:rounded-l-full last:rounded-r-full`}
              style={{ flex: `${segment.widthPercent} 1 0%`, minWidth: "14px" }}
            />
          ))}
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
