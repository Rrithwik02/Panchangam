import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DateExplorer } from "@/components/explore/DateExplorer";
import { SignInGate } from "@/components/billing/UpgradePrompt";
import { parseStrictDate } from "@/lib/api/panchangam";
import { getViewer } from "@/lib/billing/entitlement";

export const metadata: Metadata = {
  title: "Explore 50 Years of Panchangam — Panchangam Pro",
  description: "Search the complete Panchangam for any date from 2000 to 2047.",
};
export const dynamic = "force-dynamic";

// Members only. Signed-out visitors get a sign-in prompt (and the data
// endpoint refuses them too). Signed-in Free members can open Yesterday,
// Today and the Tomorrow preview; every other date requires Pro, checked on
// the server by /api/web/panchangam/date.
export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const [{ date }, viewer] = await Promise.all([searchParams, getViewer()]);
  const initialDate = date && parseStrictDate(date) ? date : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main id="main-content" className="flex-1">
        {viewer ? (
          <DateExplorer initialDate={initialDate} />
        ) : (
          <div className="mx-auto max-w-xl px-4 py-16 sm:py-24">
            <SignInGate next={initialDate ? `/explore?date=${initialDate}` : "/explore"} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
