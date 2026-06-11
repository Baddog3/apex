import { describe, expect, it } from "vitest";

import { parseOnboardingCompleteBody } from "./parse-body";

const messages = {
  nameRequired: "name",
  nameTooLong: "long",
  birthDateRequired: "date",
  birthDateFuture: "future",
  birthDateTooOld: "old",
  cityRequired: "city",
  birthTimeInvalid: "time",
  invalidRequest: "invalid",
};

describe("parseOnboardingCompleteBody", () => {
  it("parses valid body", () => {
    const result = parseOnboardingCompleteBody(
      {
        name: "Аня",
        birthDate: "1990-05-15",
        birthTime: "14:30",
        lat: 55.75,
        lng: 37.61,
        timezone: "Europe/Moscow",
        placeName: "Москва",
      },
      messages,
    );

    expect("data" in result).toBe(true);
    if ("data" in result) {
      expect(result.data.name).toBe("Аня");
      expect(result.data.birthTime).toBe("14:30");
    }
  });

  it("accepts null birth time", () => {
    const result = parseOnboardingCompleteBody(
      {
        name: "Аня",
        birthDate: "1990-05-15",
        birthTime: null,
        lat: 55.75,
        lng: 37.61,
        timezone: "Europe/Moscow",
        placeName: "Москва",
      },
      messages,
    );

    expect("data" in result).toBe(true);
    if ("data" in result) {
      expect(result.data.birthTime).toBeNull();
    }
  });

  it("rejects missing city data", () => {
    const result = parseOnboardingCompleteBody(
      {
        name: "Аня",
        birthDate: "1990-05-15",
        birthTime: null,
      },
      messages,
    );

    expect(result).toEqual({ error: "city" });
  });
});
