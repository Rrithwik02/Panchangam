"use client";

import { TimeOfDayProvider } from "@/components/celestial/TimeOfDayProvider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <TimeOfDayProvider>{children}</TimeOfDayProvider>;
}
