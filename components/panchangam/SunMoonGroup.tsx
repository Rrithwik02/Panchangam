import type { PanchangamDay } from "@/lib/types/panchangam";
import { PanchangamFieldRow } from "./PanchangamFieldRow";

interface SunMoonGroupProps {
  data: PanchangamDay;
  compact?: boolean;
}

export function SunMoonGroup({ data, compact = false }: SunMoonGroupProps) {
  const fields = compact
    ? [
        { label: "Sunrise", value: data.sunrise },
        { label: "Sunset", value: data.sunset },
      ]
    : [
        { label: "Sunrise", value: data.sunrise },
        { label: "Sunset", value: data.sunset },
        { label: "Moonrise", value: data.moonrise },
        { label: "Moonset", value: data.moonset },
      ];

  return (
    <div>
      {fields.map((field) => (
        <PanchangamFieldRow key={field.label} label={field.label} value={field.value} />
      ))}
    </div>
  );
}
