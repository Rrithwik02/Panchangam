import Link from "next/link";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/lib/account/data";

export function AccountSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-b border-border/70 py-7 first:pt-0 last:border-b-0", className)}>
      <div className="mb-4 space-y-0.5">
        <h2 className="text-lg font-serif-title font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-baseline sm:gap-6">
      <dt className="w-40 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
      <dd className="text-sm text-foreground break-words">{value}</dd>
    </div>
  );
}

export function StatusPill({ tone, children }: { tone: StatusTone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tone === "good" && "border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
        tone === "warn" && "border-accent/30 bg-accent/10 text-accent",
        tone === "neutral" && "border-border bg-card-muted text-muted"
      )}
    >
      {children}
    </span>
  );
}

const buttonBase =
  "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors disabled:opacity-60";

export const accountButton = {
  primary: `${buttonBase} bg-accent text-white hover:bg-accent-hover shadow-xs`,
  secondary: `${buttonBase} border border-border bg-card text-foreground hover:bg-card-muted`,
};

export function ButtonLink({
  href,
  variant = "secondary",
  children,
}: {
  href: string;
  variant?: keyof typeof accountButton;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={accountButton[variant]}>
      {children}
    </Link>
  );
}
