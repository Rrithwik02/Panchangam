import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AccountNav } from "@/components/account/AccountNav";
import { getViewer } from "@/lib/billing/entitlement";

export const metadata: Metadata = { title: "Account — Panchangam", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  // The proxy already redirects signed-out visitors; this is the authoritative check.
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/account");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <h1 className="mb-6 text-3xl font-serif-title font-semibold tracking-tight md:mb-8">Account</h1>
          <div className="flex flex-col gap-6 md:flex-row md:gap-10">
            <aside className="md:w-44 md:shrink-0">
              <AccountNav />
            </aside>
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
