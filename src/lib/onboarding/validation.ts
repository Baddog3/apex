const NAME_MAX_LENGTH = 100;
const MIN_BIRTH_YEAR = 1900;

export interface Step1Errors {
  name?: string;
  birthDate?: string;
}

export interface Step2Errors {
  city?: string;
}

export interface Step3Errors {
  birthTime?: string;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function validateStep1(
  name: string,
  birthDate: string,
  messages: {
    nameRequired: string;
    nameTooLong: string;
    birthDateRequired: string;
    birthDateFuture: string;
    birthDateTooOld: string;
  },
): Step1Errors {
  const errors: Step1Errors = {};
  const trimmedName = name.trim();

  if (!trimmedName) {
    errors.name = messages.nameRequired;
  } else if (trimmedName.length > NAME_MAX_LENGTH) {
    errors.name = messages.nameTooLong;
  }

  if (!birthDate) {
    errors.birthDate = messages.birthDateRequired;
  } else if (birthDate > todayIsoDate()) {
    errors.birthDate = messages.birthDateFuture;
  } else if (birthDate < `${MIN_BIRTH_YEAR}-01-01`) {
    errors.birthDate = messages.birthDateTooOld;
  }

  return errors;
}

export function validateStep2(
  hasSelectedCity: boolean,
  messages: { cityRequired: string },
): Step2Errors {
  return hasSelectedCity ? {} : { city: messages.cityRequired };
}

export function validateStep3(
  birthTime: string,
  messages: { birthTimeRequired: string; birthTimeInvalid: string },
): Step3Errors {
  if (!birthTime) {
    return { birthTime: messages.birthTimeRequired };
  }

  if (!/^\d{2}:\d{2}$/.test(birthTime)) {
    return { birthTime: messages.birthTimeInvalid };
  }

  const [hours, minutes] = birthTime.split(":").map(Number);
  if (hours > 23 || minutes > 59) {
    return { birthTime: messages.birthTimeInvalid };
  }

  return {};
}
