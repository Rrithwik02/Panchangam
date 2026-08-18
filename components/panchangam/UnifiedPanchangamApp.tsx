import { SingleLandingPage } from "@/components/landing/SingleLandingPage";
import type { PanchangamDay, LocationParameters } from "@/lib/types/panchangam";

interface UnifiedPanchangamAppProps {
  initialDay: PanchangamDay;
  initialLocation: LocationParameters;
}

export function UnifiedPanchangamApp({
  initialDay,
  initialLocation,
}: UnifiedPanchangamAppProps) {
  return (
    <SingleLandingPage initialDay={initialDay} initialLocation={initialLocation} />
  );
}
