import type { PanchangamDay } from "@/lib/types/panchangam";
import { Moon, Sunrise, Sunset } from "lucide-react";

interface SunMoonGroupProps {
  data: PanchangamDay;
  compact?: boolean;
}

export function SunMoonGroup({ data, compact = false }: SunMoonGroupProps) {
  const fields = compact
    ? [
        { label: "Sunrise", value: data.sunrise, icon: Sunrise },
        { label: "Sunset", value: data.sunset, icon: Sunset },
      ]
    : [
        { label: "Sunrise", value: data.sunrise, icon: Sunrise },
        { label: "Sunset", value: data.sunset, icon: Sunset },
        { label: "Moonrise", value: data.moonrise, icon: Moon },
        { label: "Moonset", value: data.moonset, icon: Moon },
      ];

  return (
    <div>
      {fields.map((field) => {
        const Icon = field.icon;
        const isSun = field.label === "Sunrise" || field.label === "Sunset";
        return (
          <div
            key={field.label}
            className="flex items-center justify-between gap-4 border-b border-border/60 py-2.5 last:border-0"
          >
            <span className="flex items-center gap-2 text-sm text-muted">
              <Icon
                className={`h-3.5 w-3.5 ${isSun ? "text-accent" : "text-gold"}`}
                aria-hidden="true"
              />
              {field.label}
            </span>
            <span className="text-sm font-medium tabular-nums text-foreground">
              {field.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
