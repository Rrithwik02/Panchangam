"use client";

import { TimeOfDayProvider } from "@/components/celestial/TimeOfDayProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TimeOfDayProvider>{children}</TimeOfDayProvider>
    </AuthProvider>
  );
}
