import { SingleLandingPage } from "@/components/landing/SingleLandingPage";
import { todaysPanchangam } from "@/lib/mock-panchangam";
import { getBrowserTimezone } from "@/lib/location";
import { getTodayDateForTimezone } from "@/lib/api/panchangam";
import { getPanchangamByDate } from "@/lib/services/panchangam-service";

// Panchangam data is per-date and changes daily — this page must never be
// statically prerendered, or production would freeze whatever "today" was
// at the last build and serve that snapshot to every visitor forever.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const timezone = getBrowserTimezone();
  const location = { latitude: null, longitude: null, timezone };
  const todayDate = getTodayDateForTimezone(timezone) ?? new Date().toISOString().slice(0, 10);

  const todayResult = await getPanchangamByDate(todayDate);

  return (
    <SingleLandingPage
      initialDay={todayResult.day ?? todaysPanchangam}
      initialLocation={location}
    />
  );
}
