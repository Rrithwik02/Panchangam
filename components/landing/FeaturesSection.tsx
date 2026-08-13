"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import {
  Calendar,
  Clock,
  MapPin,
  Moon,
  PartyPopper,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Daily Panchangam",
    description: "Get today's complete Panchangam in one place.",
  },
  {
    icon: Moon,
    title: "Tithi & Nakshatra",
    description: "Understand the day's key Panchangam elements.",
  },
  {
    icon: Clock,
    title: "Important Timings",
    description:
      "Rahu Kalam, Yamagandam, Gulika, Abhijit Muhurtham, and more.",
  },
  {
    icon: PartyPopper,
    title: "Festivals & Vratas",
    description: "See what is being observed today.",
  },
  {
    icon: MapPin,
    title: "Location",
    description: "Panchangam information based on your selected location.",
  },
  {
    icon: Calendar,
    title: "Date Navigation",
    description: "Explore Panchangam beyond today with Premium.",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="bg-card-muted px-4 py-20 sm:px-6 lg:px-8"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="text-center">
          <h2 id="features-heading" className="text-section-heading font-semibold">
            Everything important, right where you need it.
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 0.06}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all duration-500 hover:-translate-y-1 hover:border-accent/35 hover:shadow-lg hover:shadow-accent/5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent transition-all duration-500 group-hover:scale-105 group-hover:bg-accent group-hover:text-white group-hover:shadow-md group-hover:shadow-accent/20">
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
