import { describe, expect, it } from "vitest";

import { parseDaDataResponse } from "./dadata";
import { parseNominatimResponse } from "./nominatim";
import { normalizeGeocodeQuery, validateGeocodeQuery } from "./search";
import { timezoneFromCoords } from "./timezone";

describe("geocoding", () => {
  it("определяет Europe/Moscow для координат Москвы", () => {
    expect(timezoneFromCoords(55.7558, 37.6173)).toBe("Europe/Moscow");
  });

  it("нормализует и валидирует запрос", () => {
    expect(normalizeGeocodeQuery("  Москва  ")).toBe("Москва");
    expect(validateGeocodeQuery("М")).toMatch(/минимум/i);
    expect(validateGeocodeQuery("Москва")).toBeNull();
  });

  it("парсит ответ DaData для Москвы", () => {
    const results = parseDaDataResponse({
      suggestions: [
        {
          value: "г Москва",
          unrestricted_value: "г Москва",
          data: {
            city: "Москва",
            region: "Москва",
            country: "Россия",
            geo_lat: "55.7558",
            geo_lon: "37.6173",
          },
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Москва");
    expect(results[0].lat).toBeCloseTo(55.7558, 4);
    expect(results[0].lng).toBeCloseTo(37.6173, 4);
    expect(results[0].timezone).toBe("Europe/Moscow");
    expect(results[0].subtitle).toBe("Москва, Россия");
  });

  it("парсит ответ Nominatim для Москвы", () => {
    const results = parseNominatimResponse([
      {
        place_id: 102269,
        lat: "55.7558",
        lon: "37.6173",
        display_name: "Москва, Центральный федеральный округ, Россия",
        type: "city",
        class: "place",
        address: {
          city: "Москва",
          state: "Москва",
          country: "Россия",
        },
      },
    ]);

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Москва");
    expect(results[0].lat).toBeCloseTo(55.7558, 4);
    expect(results[0].lng).toBeCloseTo(37.6173, 4);
    expect(results[0].timezone).toBe("Europe/Moscow");
  });
});
