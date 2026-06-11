const DEFAULT_TIMEZONE = "Europe/Moscow";

/** YYYY-MM-DD в указанной IANA-таймзоне. */
export function getLocalDateString(
  timezone: string = DEFAULT_TIMEZONE,
  at: Date = new Date(),
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

export function localDateToUtcNoon(date: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    throw new Error(`Invalid date: ${date}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);

  return new Date(Date.UTC(year, month, day, 12, 0, 0));
}
