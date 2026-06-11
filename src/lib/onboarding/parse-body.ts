import { validateStep1, validateStep2 } from "./validation";

export interface OnboardingCompleteBody {
  name: string;
  birthDate: string;
  birthTime: string | null;
  lat: number;
  lng: number;
  timezone: string;
  placeName: string;
}

export function parseOnboardingCompleteBody(
  body: unknown,
  messages: {
    nameRequired: string;
    nameTooLong: string;
    birthDateRequired: string;
    birthDateFuture: string;
    birthDateTooOld: string;
    cityRequired: string;
    birthTimeInvalid: string;
    invalidRequest: string;
  },
): { data: OnboardingCompleteBody } | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: messages.invalidRequest };
  }

  const raw = body as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name : "";
  const birthDate = typeof raw.birthDate === "string" ? raw.birthDate : "";
  const birthTime =
    raw.birthTime === null
      ? null
      : typeof raw.birthTime === "string"
        ? raw.birthTime
        : null;
  const lat = typeof raw.lat === "number" ? raw.lat : NaN;
  const lng = typeof raw.lng === "number" ? raw.lng : NaN;
  const timezone = typeof raw.timezone === "string" ? raw.timezone : "";
  const placeName = typeof raw.placeName === "string" ? raw.placeName : "";

  const step1Errors = validateStep1(name, birthDate, {
    nameRequired: messages.nameRequired,
    nameTooLong: messages.nameTooLong,
    birthDateRequired: messages.birthDateRequired,
    birthDateFuture: messages.birthDateFuture,
    birthDateTooOld: messages.birthDateTooOld,
  });

  if (Object.keys(step1Errors).length > 0) {
    return {
      error:
        step1Errors.name ?? step1Errors.birthDate ?? messages.invalidRequest,
    };
  }

  const hasLocation =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    timezone.trim().length > 0 &&
    placeName.trim().length > 0;

  const step2Errors = validateStep2(hasLocation, {
    cityRequired: messages.cityRequired,
  });

  if (Object.keys(step2Errors).length > 0) {
    return { error: step2Errors.city ?? messages.invalidRequest };
  }

  if (birthTime !== null) {
    if (!/^\d{2}:\d{2}$/.test(birthTime)) {
      return { error: messages.birthTimeInvalid };
    }

    const [hours, minutes] = birthTime.split(":").map(Number);
    if (hours > 23 || minutes > 59) {
      return { error: messages.birthTimeInvalid };
    }
  }

  return {
    data: {
      name: name.trim(),
      birthDate,
      birthTime,
      lat,
      lng,
      timezone: timezone.trim(),
      placeName: placeName.trim(),
    },
  };
}
