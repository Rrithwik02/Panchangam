"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TodayPanchangamSection } from "@/components/landing/TodayPanchangamSection";
import { SunMoonSection } from "@/components/landing/SunMoonSection";
import { ImportantTimingsSection } from "@/components/landing/ImportantTimingsSection";
import { SignInGate, UpgradePrompt } from "@/components/billing/UpgradePrompt";
import { getBrowserTimezone } from "@/lib/location";
import { SUPPORTED_RANGE } from "@/lib/billing/plans";
import type { PanchangamDay, PanchangamPreviewDay } from "@/lib/types/panchangam";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; day: PanchangamDay | PanchangamPreviewDay }
  | { kind: "locked"; signedIn: boolean }
  | { kind: "signin" }
  | { kind: "error"; message: string };

function shift(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const noopSubscribe = () => () => {};

function localToday() {
  // en-CA formats as YYYY-MM-DD in the viewer's own timezone.
  return new Intl.DateTimeFormat("en-CA").format(new Date());
}

export function DateExplorer({ initialDate }: { initialDate?: string }) {
  // "Today" is resolved on the client so it uses the viewer's timezone.
  const clientToday = useSyncExternalStore(noopSubscribe, localToday, () => null);
  const [selected, setSelected] = useState<string | null>(initialDate ?? null);
  const date = selected ?? clientToday;
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const latestRequest = useRef(0);

  const load = useCallback(async (target: string) => {
    const requestId = ++latestRequest.current;
    try {
      const query = new URLSearchParams({ date: target, timezone: getBrowserTimezone() });
      const res = await fetch(`/api/web/panchangam/date?${query}`, { cache: "no-store" });
      const body = await res.json().catch(() => null);
      if (requestId !== latestRequest.current) return;

      if (res.ok && body?.success) {
        setState({ kind: "ready", day: body.data });
      } else if (body?.error?.code === "UNAUTHENTICATED") {
        // Session ended while the page was open (e.g. logged out in another tab).
        setState({ kind: "signin" });
      } else if (body?.error?.code === "PRO_REQUIRED") {
        setState({ kind: "locked", signedIn: Boolean(body.meta?.signed_in) });
      } else {
        setState({
          kind: "error",
          message: body?.error?.message ?? "We couldn't load the Panchangam for this date. Please try again.",
        });
      }
    } catch {
      if (requestId !== latestRequest.current) return;
      setState({ kind: "error", message: "Network error — please check your connection and try again." });
    }
  }, []);

  useEffect(() => {
    if (!date) return;
    const timeout = window.setTimeout(() => void load(date), 0);
    return () => window.clearTimeout(timeout);
  }, [date, load]);

  const setDate = (update: (current: string | null) => string | null) => {
    const next = update(date);
    if (!next || next === date) return;
    setState({ kind: "loading" });
    setSelected(next);
  };

  const canGoBack = Boolean(date && date > SUPPORTED_RANGE.start);
  const canGoForward = Boolean(date && date < SUPPORTED_RANGE.end);

  return (
    <div>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 shadow-xs">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">50-Year Panchangam</p>
            <p className="text-sm text-muted">
              Any date from {SUPPORTED_RANGE.start.slice(0, 4)} to {SUPPORTED_RANGE.end.slice(0, 4)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous day"
              disabled={!canGoBack}
              onClick={() => setDate((d) => (d ? shift(d, -1) : d))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-card-muted disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <label className="sr-only" htmlFor="explore-date">
              Choose a date
            </label>
            <input
              id="explore-date"
              type="date"
              value={date ?? ""}
              min={SUPPORTED_RANGE.start}
              max={SUPPORTED_RANGE.end}
              onChange={(e) => e.target.value && setDate(() => e.target.value)}
              className="min-h-[40px] flex-1 rounded-full border border-border bg-card-muted/50 px-4 text-sm text-foreground focus:border-accent focus:outline-none sm:flex-none"
            />
            <button
              type="button"
              aria-label="Next day"
              disabled={!canGoForward}
              onClick={() => setDate((d) => (d ? shift(d, 1) : d))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-card-muted disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDate(() => localToday())}
              className="min-h-[40px] rounded-full px-3 text-xs font-semibold text-accent hover:bg-accent/10"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {state.kind === "loading" && (
        <div className="flex justify-center py-24">
          <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      )}

      {state.kind === "locked" && (
        <div className="mx-auto max-w-xl px-4 py-12">
          <UpgradePrompt signedIn={state.signedIn} />
        </div>
      )}

      {state.kind === "signin" && (
        <div className="mx-auto max-w-xl px-4 py-12">
          <SignInGate next={date ? `/explore?date=${date}` : "/explore"} />
        </div>
      )}

      {state.kind === "error" && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          <div role="alert" className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-400">
            <span>{state.message}</span>
            <button
              type="button"
              onClick={() => {
                if (!date) return;
                setState({ kind: "loading" });
                void load(date);
              }}
              className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold hover:bg-red-500/20"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {state.kind === "ready" && (
        <>
          <TodayPanchangamSection data={state.day} />
          <SunMoonSection data={state.day} />
          <ImportantTimingsSection data={state.day} />
        </>
      )}
    </div>
  );
}
