import { aiChat } from "@/lib/ai/client";
import {
  calculateTransits,
  chartFromStored,
  type NatalChartResult,
  type StoredChartData,
  type TransitAspect,
} from "@/lib/astrology";
import type { HoroscopeSource } from "@/lib/db/types";

import { localDateToUtcNoon } from "./date";
import { fallbackHoroscopeText, pickMainTransit } from "./fallback";
import { formatMainTransitLabel } from "./format-transit";
import { buildHoroscopeMessages } from "./prompt";
import type { TodayHoroscope } from "./types";

export interface GenerateHoroscopeInput {
  chart: NatalChartResult;
  date: string;
  userName?: string | null;
}

export interface GeneratedHoroscope {
  text: string;
  mainTransit: TransitAspect | null;
  mainTransitLabel: string | null;
  source: HoroscopeSource;
}

export async function generateHoroscopeContent(
  input: GenerateHoroscopeInput,
): Promise<GeneratedHoroscope> {
  const at = localDateToUtcNoon(input.date);
  const transits = calculateTransits(input.chart, at);
  const mainTransit = pickMainTransit(transits);
  const mainTransitLabel = formatMainTransitLabel(mainTransit);

  const aiText = await aiChat(buildHoroscopeMessages(input.chart, transits, input.userName));

  if (aiText) {
    return {
      text: aiText,
      mainTransit,
      mainTransitLabel,
      source: "ai",
    };
  }

  return {
    text: fallbackHoroscopeText(mainTransit, input.userName),
    mainTransit,
    mainTransitLabel,
    source: "fallback",
  };
}

export function horoscopeFromStoredChart(
  stored: StoredChartData,
  input: Omit<GenerateHoroscopeInput, "chart">,
): Promise<GeneratedHoroscope> {
  return generateHoroscopeContent({
    ...input,
    chart: chartFromStored(stored),
  });
}

export function toTodayHoroscope(
  generated: GeneratedHoroscope,
  date: string,
  cached: boolean,
): TodayHoroscope {
  return {
    date,
    text: generated.text,
    mainTransit: generated.mainTransit,
    mainTransitLabel: generated.mainTransitLabel,
    source: generated.source,
    cached,
  };
}
