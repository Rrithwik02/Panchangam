import type { PanchangamDay, TimingRange } from "@/lib/types/panchangam";
import { PanchangamFieldRow } from "./PanchangamFieldRow";

function formatTiming(timing: TimingRange) {
  return `${timing.start} – ${timing.end}`;
}

interface TimingsGroupProps {
  data: PanchangamDay;
}

export function TimingsGroup({ data }: TimingsGroupProps) {
  const timings = [data.rahuKalam, data.yamagandam, data.gulikaKalam];

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
