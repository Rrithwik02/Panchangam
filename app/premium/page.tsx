import { SingleLandingPage } from "@/components/landing/SingleLandingPage";
import { todaysPanchangam } from "@/lib/mock-panchangam";
import { getBrowserTimezone } from "@/lib/location";
import { getTodayDateForTimezone } from "@/lib/api/panchangam";
import { getPanchangamByDate } from "@/lib/services/panchangam-service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Capabilities — Panchangam",
  description:
    "Explore multi-date, multi-location, and advanced astronomical Panchangam capabilities.",
};

export default async function PremiumPage() {
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
