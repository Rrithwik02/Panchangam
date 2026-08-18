import { SingleLandingPage } from "@/components/landing/SingleLandingPage";
import { getBrowserTimezone } from "@/lib/location";
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
  const todayDate = new Date().toISOString().slice(0, 10);
  const todayResult = await getPanchangamByDate(todayDate, location);

  return (
    <SingleLandingPage
      initialDay={todayResult.day}
      initialLocation={location}
    />
  );
}
