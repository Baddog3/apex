import { searchDaData } from "./dadata";
import { searchNominatim } from "./nominatim";
import type { GeocodeResult } from "./types";

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 100;

export function normalizeGeocodeQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

export function validateGeocodeQuery(query: string): string | null {
  const normalized = normalizeGeocodeQuery(query);

  if (normalized.length < MIN_QUERY_LENGTH) {
    return `Минимум ${MIN_QUERY_LENGTH} символа`;
  }

  if (normalized.length > MAX_QUERY_LENGTH) {
    return `Максимум ${MAX_QUERY_LENGTH} символов`;
  }

  return null;
}

export async function searchCities(query: string): Promise<GeocodeResult[]> {
  const normalized = normalizeGeocodeQuery(query);
  const validationError = validateGeocodeQuery(normalized);

  if (validationError) {
    throw new Error(validationError);
  }

  const apiKey = process.env.GEOCODING_API_KEY?.trim();

  if (apiKey) {
    const dadataResults = await searchDaData(normalized, apiKey);
    if (dadataResults.length > 0) {
      return dadataResults;
    }
  }

  return searchNominatim(normalized);
}
