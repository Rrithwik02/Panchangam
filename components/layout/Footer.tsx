import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-card py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-xs font-bold text-white">
              𑆪
            </span>
            <span className="font-serif-title text-base font-bold text-foreground">
              Panchangam
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted">
            <Link href="/api/openapi" className="hover:text-foreground transition-colors">
              OpenAPI Specification
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>

          <p className="text-xs text-muted/80">
            © 2026 Panchangam. Astronomical Daily Calendar.
          </p>
        </div>
      </div>
    </footer>
  );
}
