import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DateExplorer } from "@/components/explore/DateExplorer";
import { parseStrictDate } from "@/lib/api/panchangam";

export const metadata: Metadata = {
  title: "Explore 50 Years of Panchangam — Panchangam Pro",
  description: "Search the complete Panchangam for any date from 2000 to 2047.",
};
export const dynamic = "force-dynamic";

// Free visitors can open Yesterday/Today/Tomorrow here too; any other date is
// checked against the subscription on the server by /api/web/panchangam/date.
export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main id="main-content" className="flex-1">
        <DateExplorer initialDate={date && parseStrictDate(date) ? date : undefined} />
      </main>
      <Footer />
    </div>
  );
}
