import { find as findTimezone } from "geo-tz";

export function timezoneFromCoords(lat: number, lng: number): string {
  const zones = findTimezone(lat, lng);
  const zone = zones[0];

  if (!zone) {
    throw new Error(`Не удалось определить часовой пояс для ${lat}, ${lng}`);
  }

  return zone;
}
