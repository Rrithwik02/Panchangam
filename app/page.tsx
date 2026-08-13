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

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        <HeroSection />
        <PanchangamPreview />
        <DailyUpdateBanner />
        <WhyPanchangam />
        <FeaturesSection />
        <FreeVsPremium />
        <DateAccessDemo />
        <ProductExperience />
        <HowItWorks />
        <DailyHabitSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
