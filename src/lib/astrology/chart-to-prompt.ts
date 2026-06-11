import { t } from "@/lib/i18n";

import type { NatalChartResult } from "./types";
import type { TransitAspect } from "./transits";

const MAX_TRANSITS = 5;

function formatDegree(degreeInSign: number): string {
  return `${Math.round(degreeInSign)}°`;
}

function signLabel(sign: string): string {
  const strings = t();
  return strings.astrology.signs[sign as keyof typeof strings.astrology.signs] ?? sign;
}

function planetLabel(name: string): string {
  const strings = t();
  return (
    strings.astrology.planets[name as keyof typeof strings.astrology.planets] ??
    name
  );
}

function aspectLabel(type: TransitAspect["type"]): string {
  const strings = t();
  return strings.astrology.aspects[type];
}

function formatBodyLine(
  label: string,
  sign: string,
  degreeInSign: number,
): string {
  return `${label}: ${signLabel(sign)}, ${formatDegree(degreeInSign)}`;
}

/**
 * Компактное текстовое представление карты для AI-промпта (~200 токенов).
 */
export function chartToPrompt(
  chart: NatalChartResult,
  transits: TransitAspect[] = [],
): string {
  const sun = chart.planets.find((p) => p.name === "sun")!;
  const moon = chart.planets.find((p) => p.name === "moon")!;
  const asc = chart.angles?.find((a) => a.name === "ascendant");

  const lines = [
    [
      formatBodyLine("Солнце", sun.sign, sun.degreeInSign),
      formatBodyLine("Луна", moon.sign, moon.degreeInSign),
      asc
        ? formatBodyLine("Асцендент", asc.sign, asc.degreeInSign)
        : null,
    ]
      .filter(Boolean)
      .join(" | "),
  ];

  const topTransits = transits.slice(0, MAX_TRANSITS);

  if (topTransits.length > 0) {
    const transitLines = topTransits.map(
      (transit) =>
        `${planetLabel(transit.transitPlanet)} ${aspectLabel(transit.type)} натальная ${planetLabel(transit.natalBody)} (орб ${transit.orb}°)`,
    );
    lines.push(`Транзиты: ${transitLines.join("; ")}`);
  }

  return lines.join("\n");
}
