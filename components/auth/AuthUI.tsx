"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main id="main-content" className="flex-1 flex items-start sm:items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="text-3xl font-serif-title font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          </div>
          <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-5">
            {children}
          </div>
          {footer && <div className="text-center text-sm text-muted space-y-2">{footer}</div>}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function Field({
  label,
  error,
  hint,
  className,
  ...inputProps
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | null;
  hint?: string;
}) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-xs font-semibold text-foreground/80">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(
          "w-full rounded-xl border bg-card-muted/50 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/70 transition-colors focus:outline-none focus:border-accent focus:bg-card",
          error ? "border-red-500/60" : "border-border"
        )}
        {...inputProps}
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FormMessage({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm",
        tone === "error"
          ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
          : "border-accent/30 bg-accent/10 text-foreground"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", tone === "error" ? "text-red-500" : "text-accent")} />
      <div>{children}</div>
    </div>
  );
}

export function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full min-h-[44px] rounded-full bg-accent px-6 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-accent-hover disabled:opacity-60"
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          Please wait…
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
      <span className="h-px flex-1 bg-border" />
      or
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

// Placeholder until Google OAuth is configured in Supabase. When it is, set
// NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true and this calls signInWithOAuth.
export function GoogleButton({ next = "/account" }: { next?: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const enabled = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";

  const onClick = async () => {
    if (!enabled) {
      setMessage("Google sign-in is coming soon. Please use email and password for now.");
      return;
    }
    const { getSupabaseBrowserClient } = await import("@/lib/supabase/client");
    const supabase = getSupabaseBrowserClient();
    const { error } = (await supabase?.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })) ?? { error: new Error("unavailable") };
    if (error) setMessage("Google sign-in failed. Please try again or use email and password.");
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        className="w-full min-h-[44px] inline-flex items-center justify-center gap-2.5 rounded-full border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:bg-card-muted"
      >
        <GoogleMark />
        Continue with Google
      </button>
      {message && <p className="text-center text-xs text-muted">{message}</p>}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
    </svg>
  );
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-accent hover:underline">
      {children}
    </Link>
  );
}
