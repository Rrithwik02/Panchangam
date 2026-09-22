import type { PanchangamPeriodEntry } from "@/lib/types/panchangam";

const MINUTES_PER_DAY = 24 * 60;

/** Parses a "H:MM AM/PM" style clock string into minutes since midnight, or null if unparseable. */
export function parseClockTimeToMinutes(time: string): number | null {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
  if (hour === 12) hour = 0;
  if (period === "PM") hour += 12;

  return hour * 60 + minute;
}

export interface PeriodSegment {
  entry: PanchangamPeriodEntry;
  /** Share of the day this period occupies, as a percentage (0-100). Even when the underlying
   *  end times can't be parsed, every entry still gets a fair share so the timeline renders. */
  widthPercent: number;
}

/**
 * Turns a day's Tithi/Nakshatra/Yoga/Karana period entries into proportional
 * timeline segments. Falls back to equal-width segments when the entries'
 * end times can't be parsed into a strictly increasing sequence.
 */
export function buildPeriodSegments(entries: PanchangamPeriodEntry[]): PeriodSegment[] {
  if (entries.length === 0) return [];
  if (entries.length === 1) return [{ entry: entries[0], widthPercent: 100 }];

  const cutoffs = entries.slice(0, -1).map((entry) => (entry.endTime ? parseClockTimeToMinutes(entry.endTime) : null));

  const canProportion =
    cutoffs.every((value): value is number => value !== null) &&
    cutoffs.every((value, index) => index === 0 || value > (cutoffs[index - 1] as number));

  if (!canProportion) {
    const evenShare = 100 / entries.length;
    return entries.map((entry) => ({ entry, widthPercent: evenShare }));
  }

  const boundaries = [0, ...(cutoffs as number[]), MINUTES_PER_DAY];
  return entries.map((entry, index) => ({
    entry,
    widthPercent: ((boundaries[index + 1] - boundaries[index]) / MINUTES_PER_DAY) * 100,
  }));
}
