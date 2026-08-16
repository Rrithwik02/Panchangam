import { ScrollReveal } from "@/components/ScrollReveal";
import { SunMoonTimingsBar } from "@/components/celestial/SunMoonTimingsBar";
import { DayElementsGroup } from "@/components/panchangam/DayElementsGroup";
import { FestivalsList } from "@/components/panchangam/FestivalsList";
import { LocationBadge } from "@/components/panchangam/LocationBadge";
import { SpecialTimingsGroup } from "@/components/panchangam/SpecialTimingsGroup";
import { SunMoonGroup } from "@/components/panchangam/SunMoonGroup";
import { TimingsGroup } from "@/components/panchangam/TimingsGroup";
import type { PanchangamDay } from "@/lib/types/panchangam";

function PreviewGroup({
  title,
  children,
  delay,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <ScrollReveal delay={delay}>
      <div className="group rounded-2xl border border-border bg-card p-6 transition-all duration-500 hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-lg hover:shadow-accent/5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-accent">
          {title}
        </h3>
        {children}
      </div>
    </ScrollReveal>
  );
}

interface PanchangamPreviewProps {
  data: PanchangamDay;
}

export function PanchangamPreview({ data }: PanchangamPreviewProps) {

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="preview-heading">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="text-center">
          <h2 id="preview-heading" className="text-section-heading font-semibold">
            Everything you need for today.
          </h2>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <p className="text-muted">
              {data.dateLabel} · {data.vara}
            </p>
            <LocationBadge location={data.location} />
          </div>
        </ScrollReveal>

        <SunMoonTimingsBar data={data} />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PreviewGroup title="Day" delay={0.05}>
            <DayElementsGroup data={data} />
          </PreviewGroup>
          <PreviewGroup title="Sun & Moon" delay={0.1}>
            <SunMoonGroup data={data} />
          </PreviewGroup>
          <PreviewGroup title="Important Timings" delay={0.15}>
            <TimingsGroup data={data} />
          </PreviewGroup>
          <PreviewGroup title="Special Timings" delay={0.2}>
            <SpecialTimingsGroup data={data} />
          </PreviewGroup>
          <PreviewGroup title="Today" delay={0.25}>
            <FestivalsList data={data} />
          </PreviewGroup>
        </div>
      </div>
    </section>
  );
}
