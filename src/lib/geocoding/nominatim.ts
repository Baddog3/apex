import type { GeocodeResult } from "./types";
import { timezoneFromCoords } from "./timezone";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

const PLACE_TYPES = new Set([
  "city",
  "town",
  "village",
  "hamlet",
  "municipality",
  "administrative",
]);

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  country?: string;
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  class: string;
  address?: NominatimAddress;
}

function displayName(result: NominatimResult): string {
  const address = result.address;
  if (!address) {
    return result.display_name.split(",")[0]?.trim() ?? result.display_name;
  }

  return (
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    result.display_name.split(",")[0]?.trim() ??
    result.display_name
  );
}

function subtitle(result: NominatimResult): string | undefined {
  const address = result.address;
  if (!address) {
    return undefined;
  }

  const parts = [address.state, address.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : undefined;
}

function isPlace(result: NominatimResult): boolean {
  return (
    result.class === "place" ||
    PLACE_TYPES.has(result.type) ||
    Boolean(
      result.address?.city ??
        result.address?.town ??
        result.address?.village ??
        result.address?.municipality,
    )
  );
}

export function parseNominatimResponse(payload: NominatimResult[]): GeocodeResult[] {
  const results: GeocodeResult[] = [];

  for (const item of payload) {
    if (!isPlace(item)) {
      continue;
    }

    const lat = Number(item.lat);
    const lng = Number(item.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      continue;
    }

    results.push({
      id: String(item.place_id),
      name: displayName(item),
      lat,
      lng,
      timezone: timezoneFromCoords(lat, lng),
      subtitle: subtitle(item),
    });
  }

  return results;
}

export async function searchNominatim(query: string): Promise<GeocodeResult[]> {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "8");
  url.searchParams.set("accept-language", "ru");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Apex/0.1 (natal chart app)",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim error: ${response.status}`);
  }

  const payload = (await response.json()) as NominatimResult[];
  return parseNominatimResponse(payload);
}
