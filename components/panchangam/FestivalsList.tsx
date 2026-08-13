import type { PanchangamDay } from "@/lib/types/panchangam";
import { PanchangamFieldRow } from "./PanchangamFieldRow";

interface FestivalsListProps {
  data: PanchangamDay;
}

export function FestivalsList({ data }: FestivalsListProps) {
  return (
    <div>
      <PanchangamFieldRow
        label="Festivals"
        value={data.festivals.length ? data.festivals.join(", ") : "None today"}
      />
      <PanchangamFieldRow
        label="Vratas"
        value={data.vratas.length ? data.vratas.join(", ") : "None today"}
      />
    </div>
  );
}
