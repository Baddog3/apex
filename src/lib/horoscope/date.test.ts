import { describe, expect, it } from "vitest";

import { localDateToUtcNoon } from "./date";

describe("localDateToUtcNoon", () => {
  it("парсит дату в UTC полдень", () => {
    const date = localDateToUtcNoon("2026-06-11");

    expect(date.toISOString()).toBe("2026-06-11T12:00:00.000Z");
  });
});
