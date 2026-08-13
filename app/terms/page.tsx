import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — Panchangam",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← Back to home
        </Link>
        <h1 className="mt-6 text-3xl font-semibold">Terms & Conditions</h1>
        <p className="mt-4 text-muted leading-relaxed">
          This page will contain Panchangam&apos;s terms and conditions for using
          the service.
        </p>
      </div>
    </div>
  );
}
