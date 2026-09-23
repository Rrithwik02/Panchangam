"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

type Plan = "free" | "pro";

interface AuthContextValue {
  user: User | null;
  /** True until the stored session has been read on first load. */
  isLoading: boolean;
  /** Display-only; access is always enforced on the server. */
  plan: Plan | null;
  refreshPlan: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  // Nothing to wait for when Supabase isn't configured.
  const [isLoading, setIsLoading] = useState(() => getSupabasePublicConfig() !== null);
  const [plan, setPlan] = useState<Plan | null>(null);

  const refreshPlan = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const body = (await res.json()) as { signedIn: boolean; plan: Plan };
      setPlan(body.signedIn ? body.plan : null);
    } catch {
      setPlan(null);
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    // Supabase restores the persisted cookie session and keeps it refreshed;
    // this listener mirrors it (including other tabs) into React state.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
      if (event === "SIGNED_OUT") setPlan(null);
      if (session && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) {
        // Deferred: don't await other work inside the auth callback.
        setTimeout(() => void refreshPlan(), 0);
      }
    });

    return () => data.subscription.unsubscribe();
  }, [refreshPlan]);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    // "local": end only this browser's session. The default ("global") would
    // also log the user out on every other device.
    await supabase?.auth.signOut({ scope: "local" });
    setUser(null);
    setPlan(null);
    router.replace("/");
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({ user, isLoading, plan, refreshPlan, signOut }),
    [user, isLoading, plan, refreshPlan, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
