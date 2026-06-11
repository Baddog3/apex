import { describe, expect, it } from "vitest";

import { angularDistance, findAspect } from "./aspects";

describe("aspects", () => {
  it("находит квадрат в пределах орба", () => {
    expect(findAspect(90)?.type).toBe("square");
    expect(findAspect(88)?.type).toBe("square");
    expect(findAspect(82)).toBeNull();
  });

  it("считает кратчайшее угловое расстояние", () => {
    expect(angularDistance(350, 10)).toBe(20);
    expect(angularDistance(10, 350)).toBe(20);
  });
});
