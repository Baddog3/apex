import { describe, expect, it } from "vitest";

import { calculateNatalChart } from "@/lib/astrology/calculate";
import { calculateTransits } from "@/lib/astrology/transits";
import type { BirthData } from "@/lib/astrology/types";

import { getLocalDateString } from "./date";
import { fallbackHoroscopeText, pickMainTransit } from "./fallback";
import { formatMainTransitLabel } from "./format-transit";

const OBAMA_CHART: BirthData = {
  date: "1961-08-04",
  time: "19:24",
  lat: 21.3069,
  lng: -157.8583,
  timezone: "Pacific/Honolulu",
};

describe("horoscope fallback", () => {
  it("pickMainTransit выбирает аспект с наименьшим орбом", () => {
    const natal = calculateNatalChart(OBAMA_CHART);
    const transits = calculateTransits(natal, new Date("2020-01-15T12:00:00Z"));

    const main = pickMainTransit(transits);
    expect(main).toBe(transits[0]);
  });

  it("fallbackHoroscopeText возвращает русский текст для главного транзита", () => {
    const natal = calculateNatalChart(OBAMA_CHART);
    const transits = calculateTransits(natal, new Date("2020-01-15T12:00:00Z"));
    const text = fallbackHoroscopeText(pickMainTransit(transits), "Аня");

    expect(text).toContain("Аня");
    expect(text).toContain("транзитный");
    expect(text.length).toBeGreaterThan(40);
  });

  it("fallbackHoroscopeText без транзитов — спокойный день", () => {
    const text = fallbackHoroscopeText(null);

    expect(text.toLowerCase()).toContain("спокойный");
    expect(text).not.toContain("транзитный");
  });

  it("formatMainTransitLabel формирует подпись главного транзита", () => {
    const natal = calculateNatalChart(OBAMA_CHART);
    const transits = calculateTransits(natal, new Date("2020-01-15T12:00:00Z"));
    const label = formatMainTransitLabel(pickMainTransit(transits));

    expect(label).toMatch(/□|△|☌|☍|✶|⚻/);
    expect(label).toContain("тво");
  });
});

describe("getLocalDateString", () => {
  it("возвращает YYYY-MM-DD", () => {
    const value = getLocalDateString(
      "Europe/Moscow",
      new Date("2026-06-11T10:00:00Z"),
    );

    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
