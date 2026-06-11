import { describe, expect, it } from "vitest";

import { validateStep1, validateStep2, validateStep3 } from "./validation";

const step1Messages = {
  nameRequired: "name",
  nameTooLong: "long",
  birthDateRequired: "date",
  birthDateFuture: "future",
  birthDateTooOld: "old",
};

const step3Messages = {
  birthTimeRequired: "required",
  birthTimeInvalid: "invalid",
};

describe("validateStep1", () => {
  it("requires name and birth date", () => {
    expect(validateStep1("", "", step1Messages)).toEqual({
      name: "name",
      birthDate: "date",
    });
  });

  it("rejects future birth date", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const iso = future.toISOString().slice(0, 10);

    expect(validateStep1("Аня", iso, step1Messages)).toEqual({
      birthDate: "future",
    });
  });
});

describe("validateStep2", () => {
  it("requires selected city", () => {
    expect(validateStep2(false, { cityRequired: "city" })).toEqual({
      city: "city",
    });
    expect(validateStep2(true, { cityRequired: "city" })).toEqual({});
  });
});

describe("validateStep3", () => {
  it("requires time when finishing with time", () => {
    expect(validateStep3("", step3Messages)).toEqual({ birthTime: "required" });
  });

  it("accepts valid HH:MM", () => {
    expect(validateStep3("14:30", step3Messages)).toEqual({});
  });

  it("rejects invalid time", () => {
    expect(validateStep3("25:00", step3Messages)).toEqual({ birthTime: "invalid" });
  });
});
