import type { AspectType } from "@/lib/astrology";
import type { TransitAspect } from "@/lib/astrology";
import { t } from "@/lib/i18n";

const ASPECT_SYMBOLS: Record<AspectType, string> = {
  conjunction: "☌",
  opposition: "☍",
  trine: "△",
  square: "□",
  sextile: "✶",
  quincunx: "⚻",
};

const POSSESSIVE_PLANET: Record<string, string> = {
  sun: "твоё",
  moon: "твоя",
  mercury: "твой",
  venus: "твоя",
  mars: "твой",
  jupiter: "твой",
  saturn: "твой",
  uranus: "твой",
  neptune: "твой",
  pluto: "твой",
  northnode: "твой",
  southnode: "твой",
  lilith: "твоя",
  ascendant: "твой",
  midheaven: "твой",
};

function planetLabel(name: string): string {
  const strings = t();
  return (
    strings.astrology.planets[name as keyof typeof strings.astrology.planets] ??
    name
  );
}

/** «Сатурн □ твоя Луна» */
export function formatMainTransitLabel(transit: TransitAspect | null): string | null {
  if (!transit) {
    return null;
  }

  const symbol = ASPECT_SYMBOLS[transit.type];
  const possessive = POSSESSIVE_PLANET[transit.natalBody] ?? "твоя";
  const natal = planetLabel(transit.natalBody).toLowerCase();

  return `${planetLabel(transit.transitPlanet)} ${symbol} ${possessive} ${natal}`;
}
