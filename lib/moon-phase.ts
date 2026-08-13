export interface MoonPhaseInfo {
  tithiNumber: number;
  paksha: "shukla" | "krishna";
  illumination: number;
  isWaxing: boolean;
  label: string;
  isVisible: boolean;
}

const TITHI_MAP: Record<string, number> = {
  prathama: 1,
  padya: 1,
  pratipada: 1,
  dwitiya: 2,
  dvitiya: 2,
  tritiya: 3,
  chaturthi: 4,
  panchami: 5,
  shashthi: 6,
  shashti: 6,
  saptami: 7,
  ashtami: 8,
  navami: 9,
  dashami: 10,
  ekadashi: 11,
  dwadashi: 12,
  trayodashi: 13,
  chaturdashi: 14,
  pournami: 15,
  purnima: 15,
  amavasya: 15,
};

function parseTithiNumber(tithi: string): number {
  const lower = tithi.toLowerCase();

  if (lower.includes("amavasya")) return 15;
  if (lower.includes("pournami") || lower.includes("purnima")) return 15;

  for (const [name, num] of Object.entries(TITHI_MAP)) {
    if (lower.includes(name)) return num;
  }

  return 8;
}

function parsePaksha(paksha: string, tithi: string): "shukla" | "krishna" {
  const lower = (paksha + " " + tithi).toLowerCase();
  if (lower.includes("krishna")) return "krishna";
  return "shukla";
}

export function getMoonPhaseFromTithi(
  tithi: string,
  paksha: string
): MoonPhaseInfo {
  const lower = tithi.toLowerCase();
  const pakshaType = parsePaksha(paksha, tithi);
  const tithiNumber = parseTithiNumber(tithi);

  if (lower.includes("amavasya")) {
    return {
      tithiNumber,
      paksha: pakshaType,
      illumination: 0,
      isWaxing: true,
      label: "Amavasya",
      isVisible: false,
    };
  }

  if (lower.includes("pournami") || lower.includes("purnima")) {
    return {
      tithiNumber,
      paksha: pakshaType,
      illumination: 1,
      isWaxing: false,
      label: "Pournami",
      isVisible: true,
    };
  }

  let illumination: number;
  let isWaxing: boolean;

  if (pakshaType === "shukla") {
    illumination = tithiNumber / 15;
    isWaxing = true;
  } else {
    illumination = (15 - tithiNumber) / 15;
    isWaxing = false;
  }

  illumination = Math.max(0, Math.min(1, illumination));

  return {
    tithiNumber,
    paksha: pakshaType,
    illumination,
    isWaxing,
    label: `${pakshaType === "shukla" ? "Shukla" : "Krishna"} · ${Math.round(illumination * 100)}% lit`,
    isVisible: illumination > 0.02,
  };
}
