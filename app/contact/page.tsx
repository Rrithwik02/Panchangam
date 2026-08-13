import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Panchangam",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← Back to home
        </Link>
        <h1 className="mt-6 text-3xl font-semibold">Contact</h1>
        <p className="mt-4 text-muted leading-relaxed">
          Have questions or feedback? We&apos;d love to hear from you. Reach out at{" "}
          <a href="mailto:hello@panchangam.app" className="text-accent hover:underline">
            hello@panchangam.app
          </a>
          .
        </p>
      </div>
    </div>
  );
}
