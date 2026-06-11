import { describe, expect, it } from "vitest";

import { calculateNatalChart } from "./calculate";
import type { BirthData } from "./types";

/**
 * Эталон: Barack Obama, 4 августа 1961, 19:24, Гонолулу.
 * Проверено против astro.com (Placidus, tropical).
 * @see https://www.astro.com/cgi/chart.cgi
 */
const OBAMA_CHART: BirthData = {
  date: "1961-08-04",
  time: "19:24",
  lat: 21.3069,
  lng: -157.8583,
  timezone: "Pacific/Honolulu",
};

describe("calculateNatalChart", () => {
  it("считает эталонную карту Obama (astro.com)", () => {
    const chart = calculateNatalChart(OBAMA_CHART);

    expect(chart.hasBirthTime).toBe(true);
    expect(chart.sunSign).toBe("leo");
    expect(chart.moonSign).toBe("gemini");
    expect(chart.risingSign).toBe("aquarius");

    const sun = chart.planets.find((p) => p.name === "sun")!;
    const moon = chart.planets.find((p) => p.name === "moon")!;
    const asc = chart.angles!.find((a) => a.name === "ascendant")!;

    expect(sun.longitude).toBeCloseTo(132.55, 0);
    expect(sun.degreeInSign).toBeCloseTo(12.55, 0);
    expect(sun.sign).toBe("leo");
    expect(sun.house).toBe(6);

    expect(moon.longitude).toBeCloseTo(63.35, 0);
    expect(moon.sign).toBe("gemini");

    expect(asc.longitude).toBeCloseTo(318.06, 0);
    expect(asc.sign).toBe("aquarius");
    expect(asc.degreeInSign).toBeCloseTo(18.06, 0);

    expect(chart.houses).toHaveLength(12);
    expect(chart.houses![0].sign).toBe("aquarius");

    const sunOppositionAsc = chart.aspects.find(
      (a) =>
        a.type === "opposition" &&
        ((a.body1 === "sun" && a.body2 === "ascendant") ||
          (a.body1 === "ascendant" && a.body2 === "sun")),
    );
    expect(sunOppositionAsc).toBeDefined();
    expect(sunOppositionAsc!.orb).toBeCloseTo(5.51, 0);
  });

  it("без времени рождения — планеты без домов и углов", () => {
    const chart = calculateNatalChart({
      date: OBAMA_CHART.date,
      lat: OBAMA_CHART.lat,
      lng: OBAMA_CHART.lng,
      timezone: OBAMA_CHART.timezone,
    });

    expect(chart.hasBirthTime).toBe(false);
    expect(chart.sunSign).toBe("leo");
    expect(chart.risingSign).toBeUndefined();
    expect(chart.houses).toBeUndefined();
    expect(chart.angles).toBeUndefined();

    for (const planet of chart.planets) {
      expect(planet.house).toBeUndefined();
    }

    const hasAngleAspect = chart.aspects.some(
      (a) => a.body1 === "ascendant" || a.body2 === "ascendant",
    );
    expect(hasAngleAspect).toBe(false);
  });

  it("отклоняет некорректные данные", () => {
    expect(() =>
      calculateNatalChart({ ...OBAMA_CHART, date: "04-08-1961" }),
    ).toThrow(/дата/i);

    expect(() =>
      calculateNatalChart({ ...OBAMA_CHART, time: "25:00" }),
    ).toThrow(/время/i);

    expect(() => calculateNatalChart({ ...OBAMA_CHART, lat: 95 })).toThrow(
      /широта/i,
    );
  });
});
