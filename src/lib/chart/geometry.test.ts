import { describe, expect, it } from "vitest";

import { longitudeToWheelAngle, polarToCartesian, WHEEL_CENTER } from "./geometry";

describe("longitudeToWheelAngle", () => {
  it("ставит асцендент слева (9 ч)", () => {
    expect(longitudeToWheelAngle(318, 318)).toBeCloseTo(180, 5);
  });

  it("ставит оппозицию асценденту справа (3 ч)", () => {
    expect(longitudeToWheelAngle(138, 318)).toBeCloseTo(0, 5);
  });

  it("без времени рождения — 0° Овна слева", () => {
    expect(longitudeToWheelAngle(0, null)).toBe(180);
    expect(longitudeToWheelAngle(90, null)).toBe(270);
  });
});

describe("polarToCartesian", () => {
  it("180° — точка слева от центра", () => {
    const { x, y } = polarToCartesian(WHEEL_CENTER, WHEEL_CENTER, 100, 180);
    expect(x).toBeCloseTo(WHEEL_CENTER - 100, 5);
    expect(y).toBeCloseTo(WHEEL_CENTER, 5);
  });
});
