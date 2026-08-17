"use client";

import { useState } from "react";
import { Compass, Moon, Star, Sparkles, Search } from "lucide-react";

export function ExplorePanchangamView() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      title: "Tithis & Pakshas",
      icon: Moon,
      count: "30 Tithis",
      description: "Explore the 15 lunar days of Shukla and Krishna paksha.",
      items: ["Prathama", "Dwitiya", "Tritiya", "Ekadashi", "Pournami", "Amavasya"],
    },
    {
      title: "Nakshatras & Constellations",
      icon: Star,
      count: "27 Nakshatras",
      description: "Explore the 27 lunar mansions and their stellar attributes.",
      items: ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Swati"],
    },
    {
      title: "Festivals & Vratas",
      icon: Sparkles,
      count: "Annual Festivals",
      description: "Discover auspicious Indian festivals, observances, and vratas.",
      items: ["Diwali", "Mahashivratri", "Holi", "Ugadi", "Ganesh Chaturthi", "Navratri"],
    },
  ];

  const filteredCategories = searchQuery
    ? categories.map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => item.toLowerCase().includes(searchQuery.toLowerCase())),
      }))
    : categories;

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-sm">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            <Compass className="h-3.5 w-3.5" />
            Explore Panchangam
          </div>
          <h2 className="text-3xl font-serif-title font-semibold">
            Directory of Tithis, Nakshatras & Festivals
          </h2>
          <p className="text-sm text-muted">
            Search and explore astronomical elements, celestial stars, and auspicious observances.
          </p>

          {/* Search Input */}
          <div className="relative mt-4">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search Tithi, Nakshatra, or Festival..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-card-muted/60 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {filteredCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.title} className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-muted bg-card-muted px-2.5 py-1 rounded-full border border-border/60">
                  {cat.count}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-serif-title font-semibold">{cat.title}</h3>
                <p className="mt-1 text-xs text-muted leading-relaxed">{cat.description}</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
                {cat.items.map((item) => (
                  <span
                    key={item}
                    className="inline-block rounded-lg border border-border/70 bg-card-muted/80 px-2.5 py-1 text-xs font-medium text-foreground hover:border-accent/50 cursor-pointer transition-colors"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
