import { describe, expect, it } from "vitest";

import { chartToPrompt } from "./chart-to-prompt";
import { calculateNatalChart } from "./calculate";
import { calculateTransits } from "./transits";
import type { BirthData } from "./types";

const OBAMA_CHART: BirthData = {
  date: "1961-08-04",
  time: "19:24",
  lat: 21.3069,
  lng: -157.8583,
  timezone: "Pacific/Honolulu",
};

describe("chartToPrompt", () => {
  it("формирует стабильный компактный текст на русском", () => {
    const chart = calculateNatalChart(OBAMA_CHART);
    const transits = calculateTransits(chart, new Date("2020-01-15T12:00:00Z"));
    const prompt = chartToPrompt(chart, transits);

    expect(prompt).toContain("Солнце: Лев");
    expect(prompt).toContain("Луна: Близнецы");
    expect(prompt).toContain("Асцендент: Водолей");
    expect(prompt).toContain("Транзиты:");

    const again = chartToPrompt(chart, transits);
    expect(prompt).toBe(again);
  });

  it("работает без транзитов", () => {
    const chart = calculateNatalChart({
      date: OBAMA_CHART.date,
      lat: OBAMA_CHART.lat,
      lng: OBAMA_CHART.lng,
      timezone: OBAMA_CHART.timezone,
    });

    const prompt = chartToPrompt(chart);

    expect(prompt).toContain("Солнце: Лев");
    expect(prompt).not.toContain("Асцендент");
    expect(prompt).not.toContain("Транзиты:");
  });
});
