import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { DailyHabitSection } from "@/components/landing/DailyHabitSection";
import { DailyUpdateBanner } from "@/components/landing/DailyUpdateBanner";
import { FAQSection } from "@/components/landing/FAQSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PanchangamPreview } from "@/components/landing/PanchangamPreview";
import { ProductExperience } from "@/components/landing/ProductExperience";
import { WhyPanchangam } from "@/components/landing/WhyPanchangam";
import { DateAccessDemo } from "@/components/premium/DateAccessDemo";
import { FreeVsPremium } from "@/components/premium/FreeVsPremium";
import { TimeOfDayProviderBase } from "@/components/celestial/TimeOfDayProvider";
import { getBrowserTimezone } from "@/lib/location";
import { getPanchangamByDate } from "@/lib/services/panchangam-service";

export default async function Home() {
  const timezone = getBrowserTimezone();
  const location = { latitude: null, longitude: null, timezone };
  const todayDate = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(`${todayDate}T00:00:00Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const tomorrowDate = tomorrow.toISOString().slice(0, 10);

  const [todayResult, tomorrowResult] = await Promise.all([
    getPanchangamByDate(todayDate, location),
    getPanchangamByDate(tomorrowDate, location),
  ]);

  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        <TimeOfDayProviderBase data={todayResult.day}>
          <HeroSection data={todayResult.day} />
          <PanchangamPreview data={todayResult.day} />
          <DailyUpdateBanner />
          <WhyPanchangam />
          <FeaturesSection />
          <FreeVsPremium />
          <DateAccessDemo todayData={todayResult.day} tomorrowData={tomorrowResult.day} />
          <ProductExperience todayData={todayResult.day} tomorrowData={tomorrowResult.day} />
          <HowItWorks />
          <DailyHabitSection data={todayResult.day} />
          <FAQSection />
          <FinalCTA />
        </TimeOfDayProviderBase>
      </main>
      <Footer />
    </>
  );
}
