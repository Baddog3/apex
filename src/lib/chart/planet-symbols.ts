import type { PlanetKey, PointKey } from "@/lib/astrology";

const PLANET_SYMBOLS: Record<PlanetKey | PointKey, string> = {
  sun: "☉",
  moon: "☽",
  mercury: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
  uranus: "♅",
  neptune: "♆",
  pluto: "♇",
  northnode: "☊",
  southnode: "☋",
  lilith: "⚸",
};

const ANGLE_SYMBOLS: Record<"ascendant" | "midheaven", string> = {
  ascendant: "As",
  midheaven: "MC",
};

export function getBodySymbol(name: string): string {
  if (name in PLANET_SYMBOLS) {
    return PLANET_SYMBOLS[name as PlanetKey | PointKey];
  }

  if (name in ANGLE_SYMBOLS) {
    return ANGLE_SYMBOLS[name as keyof typeof ANGLE_SYMBOLS];
  }

  return name.slice(0, 2);
}
