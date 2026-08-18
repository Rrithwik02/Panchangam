import { SingleLandingPage } from "@/components/landing/SingleLandingPage";
import { getBrowserTimezone } from "@/lib/location";
import { getPanchangamByDate } from "@/lib/services/panchangam-service";

export default async function Home() {
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
