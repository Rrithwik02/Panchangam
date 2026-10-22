import type { PanchangamDay, PanchangamPreviewDay } from "@/lib/types/panchangam";

function weekdayName(isoDate: string) {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(parsed);
}

// "until 1:19 AM (Next Day)" for clock times; labels like "Spans to next day" are dropped.
function until(endTime?: string) {
  return endTime && /^\d/.test(endTime) ? ` until ${endTime}` : "";
}

/**
 * One self-contained plain-text sentence group about the day, built from the
 * same data the page shows. Written to stand alone, so search and AI answers
 * can quote it without the surrounding page.
 */
export function buildDaySummary(day: PanchangamDay | PanchangamPreviewDay): string {
  const tithi = day.tithis[0];
  const nakshatra = day.nakshatras[0];
  const weekday = weekdayName(day.date);
  const lead = weekday ? `On ${weekday}, ${day.dateLabel}` : `On ${day.dateLabel}`;

  const parts: string[] = [];
  if (tithi) {
    const paksha = tithi.paksha ?? day.paksha;
    parts.push(`the Tithi is ${paksha ? `${paksha} ` : ""}${tithi.name}${until(tithi.endTime)}`);
  }
  if (nakshatra) {
    parts.push(`the Nakshatra is ${nakshatra.name}${until(nakshatra.endTime)}`);
  }

  let text = parts.length ? `${lead}, ${parts.join(" and ")}.` : `${lead}.`;

  if ("rahuKalam" in day && day.rahuKalam?.start) {
    text += ` Rahu Kalam is ${day.rahuKalam.start} – ${day.rahuKalam.end}.`;
  }
  if ("sunrise" in day && day.sunrise && day.sunset) {
    text += ` Sunrise is ${day.sunrise} and sunset is ${day.sunset}.`;
  }
  return text;
}
