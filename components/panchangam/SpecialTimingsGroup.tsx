import type { PanchangamDay, TimingRange } from "@/lib/types/panchangam";
import { PanchangamFieldRow } from "./PanchangamFieldRow";

function formatTiming(timing: TimingRange) {
  return `${timing.start} – ${timing.end}`;
}

interface SpecialTimingsGroupProps {
  data: PanchangamDay;
}

export function SpecialTimingsGroup({ data }: SpecialTimingsGroupProps) {
  const timings = [
    data.abhijitMuhurtham,
    data.durmuhurtham,
    data.varjyam,
    data.amritaKalam,
  ];

  return (
    <div>
      {timings.map((timing) => (
        <PanchangamFieldRow
          key={timing.label}
          label={timing.label}
          value={formatTiming(timing)}
        />
      ))}
    </div>
  );
}
