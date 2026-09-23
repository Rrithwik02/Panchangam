import {
  getTodayDateForTimezone,
  getTomorrowDateForTimezone,
  getYesterdayDateForTimezone,
} from "@/lib/api/panchangam";
import { SUPPORTED_RANGE } from "@/lib/billing/plans";

export type DateAccess = "full" | "preview" | "pro_required" | "out_of_range";

/**
 * Website access rules for a single date:
 *   Yesterday, Today      → full for everyone
 *   Tomorrow              → full for PRO, preview (existing Tomorrow fields) for Free
 *   Any other date 2000–2047 → PRO only
 */
export function resolveDateAccess(date: string, timezone: string, isPro: boolean): DateAccess {
  const today = getTodayDateForTimezone(timezone);
  const yesterday = getYesterdayDateForTimezone(timezone);
  const tomorrow = getTomorrowDateForTimezone(timezone);

  if (date === today || date === yesterday) return "full";
  if (date === tomorrow) return isPro ? "full" : "preview";
  if (date < SUPPORTED_RANGE.start || date > SUPPORTED_RANGE.end) return "out_of_range";
  return isPro ? "full" : "pro_required";
}
