import { describe, expect, it } from "vitest";

import { getChartAccess } from "./access";

describe("getChartAccess", () => {
  it("без времени рождения скрывает дома и аспекты", () => {
    const access = getChartAccess("free", false);

    expect(access.wheel.showHouses).toBe(false);
    expect(access.wheel.showAspects).toBe(false);
    expect(access.houses.lockReason).toBe("no_birth_time");
    expect(access.aspects.lockReason).toBe("no_birth_time");
  });

  it("free с временем — premium-заглушки на домах и аспектах", () => {
    const access = getChartAccess("free", true);

    expect(access.wheel.showHouses).toBe(false);
    expect(access.wheel.showAspects).toBe(false);
    expect(access.houses.lockReason).toBe("premium");
    expect(access.aspects.lockReason).toBe("premium");
  });

  it("premium с временем открывает всё", () => {
    const access = getChartAccess("premium", true);

    expect(access.wheel.showHouses).toBe(true);
    expect(access.wheel.showAspects).toBe(true);
    expect(access.houses.unlocked).toBe(true);
    expect(access.aspects.unlocked).toBe(true);
  });
});
