import type { GeocodeResult } from "./types";
import { timezoneFromCoords } from "./timezone";

const DADATA_URL =
  "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";

interface DaDataSuggestion {
  value: string;
  unrestricted_value: string;
  data: {
    city?: string | null;
    settlement?: string | null;
    region?: string | null;
    country?: string | null;
    geo_lat?: string | null;
    geo_lon?: string | null;
  };
}

interface DaDataResponse {
  suggestions: DaDataSuggestion[];
}

function displayName(suggestion: DaDataSuggestion): string {
  return (
    suggestion.data.city ??
    suggestion.data.settlement ??
    suggestion.value.replace(/^г\s+/i, "")
  );
}

function subtitle(suggestion: DaDataSuggestion): string | undefined {
  const parts = [suggestion.data.region, suggestion.data.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : undefined;
}

export function parseDaDataResponse(payload: DaDataResponse): GeocodeResult[] {
  const results: GeocodeResult[] = [];

  for (const suggestion of payload.suggestions) {
    const lat = Number(suggestion.data.geo_lat);
    const lng = Number(suggestion.data.geo_lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      continue;
    }

    const name = displayName(suggestion);

    results.push({
      id: suggestion.unrestricted_value,
      name,
      lat,
      lng,
      timezone: timezoneFromCoords(lat, lng),
      subtitle: subtitle(suggestion),
    });
  }

  return results;
}

export async function searchDaData(
  query: string,
  apiKey: string,
): Promise<GeocodeResult[]> {
  const response = await fetch(DADATA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Token ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      count: 8,
      from_bound: { value: "city" },
      to_bound: { value: "settlement" },
    }),
  });

  if (!response.ok) {
    throw new Error(`DaData error: ${response.status}`);
  }

  const payload = (await response.json()) as DaDataResponse;
  return parseDaDataResponse(payload);
}
