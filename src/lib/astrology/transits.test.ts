import { describe, expect, it } from "vitest";

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

describe("calculateTransits", () => {
  it("возвращает аспекты транзитных планет к натальным телам", () => {
    const natal = calculateNatalChart(OBAMA_CHART);
    const transits = calculateTransits(natal, new Date("2020-01-15T12:00:00Z"));

    expect(transits.length).toBeGreaterThan(0);

    for (const transit of transits) {
      expect(transit.orb).toBeLessThanOrEqual(8);
      expect(transit.transitPlanet).toBeTruthy();
      expect(transit.natalBody).toBeTruthy();
      expect(transit.type).toBeTruthy();
    }

    const sorted = [...transits].sort((a, b) => a.orb - b.orb);
    expect(transits[0].orb).toBe(sorted[0].orb);
  });

  it("включает натальные углы при наличии времени рождения", () => {
    const natal = calculateNatalChart(OBAMA_CHART);
    const transits = calculateTransits(natal, new Date("2020-06-01T12:00:00Z"));

    const toAscendant = transits.some((t) => t.natalBody === "ascendant");
    expect(toAscendant).toBe(true);
  });
});
