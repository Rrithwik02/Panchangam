import type { PanchangamDay } from "@/lib/types/panchangam";
import { PanchangamFieldRow } from "./PanchangamFieldRow";

interface DayElementsGroupProps {
  data: PanchangamDay;
  compact?: boolean;
}

export function DayElementsGroup({ data, compact = false }: DayElementsGroupProps) {
  const fields = compact
    ? [
        { label: "Tithi", value: data.tithi },
        { label: "Vara", value: data.vara },
        { label: "Nakshatra", value: data.nakshatra },
      ]
    : [
        { label: "Tithi", value: data.tithi },
        { label: "Vara", value: data.vara },
        { label: "Paksha", value: data.paksha },
        { label: "Nakshatra", value: data.nakshatra },
        { label: "Yoga", value: data.yoga },
        { label: "Karana", value: data.karana },
      ];

  return (
    <div>
      {fields.map((field) => (
        <PanchangamFieldRow key={field.label} label={field.label} value={field.value} />
      ))}
    </div>
  );
}
