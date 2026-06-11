import type { AspectType, ZodiacSign } from "@/lib/astrology";
import { t } from "@/lib/i18n";

const ASPECT_SYMBOLS: Record<AspectType, string> = {
  conjunction: "☌",
  opposition: "☍",
  trine: "△",
  square: "□",
  sextile: "✶",
  quincunx: "⚻",
};

export function formatDegree(degreeInSign: number): string {
  return `${Math.round(degreeInSign)}°`;
}

export function signLabel(sign: ZodiacSign | string): string {
  const strings = t();
  return strings.astrology.signs[sign as keyof typeof strings.astrology.signs] ?? sign;
}

export function bodyLabel(name: string): string {
  const strings = t();
  return (
    strings.astrology.planets[name as keyof typeof strings.astrology.planets] ?? name
  );
}

export function formatSignDegree(sign: ZodiacSign | string, degreeInSign: number): string {
  return `${signLabel(sign)}, ${formatDegree(degreeInSign)}`;
}

export function aspectSymbol(type: AspectType): string {
  return ASPECT_SYMBOLS[type];
}

export function formatAspectLine(
  body1: string,
  body2: string,
  type: AspectType,
  orb: number,
): string {
  const symbol = aspectSymbol(type);
  return `${bodyLabel(body1)} ${symbol} ${bodyLabel(body2)} · ${orb.toFixed(1)}°`;
}
