import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Panchangam",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← Back to home
        </Link>
        <h1 className="mt-6 text-3xl font-semibold">About Panchangam</h1>
        <p className="mt-4 text-muted leading-relaxed">
          Panchangam is a modern Panchangam experience built to make traditional
          knowledge easy for anyone to understand and use. We believe daily
          Panchangam should be clear, complete, and calm — not cluttered or
          confusing.
        </p>
      </div>
    </div>
  );
}
