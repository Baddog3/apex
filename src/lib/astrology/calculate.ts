import { Horoscope, Origin } from "circular-natal-horoscope-js";

import type {
  AnglePosition,
  Aspect,
  AspectType,
  BirthData,
  House,
  NatalChartResult,
  PlanetKey,
  PlanetPosition,
  PointKey,
  ZodiacSign,
} from "./types";

const PLANET_KEYS: PlanetKey[] = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
];

const POINT_KEYS: PointKey[] = ["northnode", "southnode", "lilith"];

const MAJOR_ASPECTS = new Set<AspectType>([
  "conjunction",
  "opposition",
  "trine",
  "square",
  "sextile",
]);

const DEFAULT_TIME = "12:00";

/** Локальное время по умолчанию, если время рождения неизвестно. */
export const NO_BIRTH_TIME_DEFAULT = DEFAULT_TIME;

function parseDateParts(date: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    throw new Error(`Некорректная дата: ${date}. Ожидается YYYY-MM-DD`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error(`Некорректная дата: ${date}`);
  }

  return { year, month, day };
}

function parseTimeParts(time: string): { hour: number; minute: number } {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) {
    throw new Error(`Некорректное время: ${time}. Ожидается HH:MM`);
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour > 23 || minute > 59) {
    throw new Error(`Некорректное время: ${time}`);
  }

  return { hour, minute };
}

function assertCoordinates(lat: number, lng: number): void {
  if (lat < -90 || lat > 90) {
    throw new Error(`Широта вне диапазона: ${lat}`);
  }
  if (lng < -180 || lng > 180) {
    throw new Error(`Долгота вне диапазона: ${lng}`);
  }
}

function toZodiacSign(key: string): ZodiacSign {
  return key as ZodiacSign;
}

function degreeInSign(longitude: number): number {
  const normalized = ((longitude % 360) + 360) % 360;
  return normalized % 30;
}

function mapPlanet(
  body: {
    key: string;
    Sign: { key: string };
    ChartPosition: { Ecliptic: { DecimalDegrees: number } };
    isRetrograde?: boolean;
    House?: { id: number };
  },
  includeHouses: boolean,
): PlanetPosition {
  const longitude = body.ChartPosition.Ecliptic.DecimalDegrees;

  return {
    name: body.key as PlanetKey | PointKey,
    longitude,
    sign: toZodiacSign(body.Sign.key),
    degreeInSign: degreeInSign(longitude),
    house: includeHouses ? body.House?.id : undefined,
    retrograde: body.isRetrograde ?? false,
  };
}

function mapAngle(
  body: {
    key: string;
    Sign: { key: string };
    ChartPosition: { Ecliptic: { DecimalDegrees: number } };
  },
  name: AnglePosition["name"],
): AnglePosition {
  const longitude = body.ChartPosition.Ecliptic.DecimalDegrees;

  return {
    name,
    longitude,
    sign: toZodiacSign(body.Sign.key),
    degreeInSign: degreeInSign(longitude),
  };
}

function mapHouses(houses: Horoscope["Houses"]): House[] {
  return houses.map((house) => {
    const longitude = house.ChartPosition.StartPosition.Ecliptic.DecimalDegrees;

    return {
      number: house.id,
      sign: toZodiacSign(house.Sign.key),
      longitude,
      degreeInSign: degreeInSign(longitude),
    };
  });
}

function mapAspects(
  aspects: Horoscope["Aspects"]["all"],
  includeAngles: boolean,
): Aspect[] {
  const angleKeys = new Set(["ascendant", "midheaven"]);

  return aspects
    .filter((aspect) => {
      if (!MAJOR_ASPECTS.has(aspect.aspectKey as AspectType)) {
        return false;
      }
      if (includeAngles) {
        return true;
      }
      return (
        !angleKeys.has(aspect.point1Key) && !angleKeys.has(aspect.point2Key)
      );
    })
    .map((aspect) => ({
      body1: aspect.point1Key,
      body2: aspect.point2Key,
      type: aspect.aspectKey as AspectType,
      orb: Math.round(aspect.orb * 100) / 100,
    }));
}

function buildHoroscope(origin: Origin, hasBirthTime: boolean): Horoscope {
  return new Horoscope({
    origin,
    houseSystem: "placidus",
    zodiac: "tropical",
    aspectPoints: hasBirthTime
      ? ["bodies", "points", "angles"]
      : ["bodies", "points"],
    aspectWithPoints: hasBirthTime
      ? ["bodies", "points", "angles"]
      : ["bodies", "points"],
    aspectTypes: ["major"],
    customOrbs: {},
    language: "en",
  });
}

/**
 * Считает натальную карту по данным рождения.
 * Без времени — планеты на полдень локального времени, без домов и углов.
 */
export function calculateNatalChart(birth: BirthData): NatalChartResult {
  assertCoordinates(birth.lat, birth.lng);

  const hasBirthTime = Boolean(birth.time?.trim());
  const { year, month, day } = parseDateParts(birth.date);
  const { hour, minute } = parseTimeParts(
    hasBirthTime ? birth.time! : DEFAULT_TIME,
  );

  const origin = new Origin({
    year,
    month: month - 1,
    date: day,
    hour,
    minute,
    latitude: birth.lat,
    longitude: birth.lng,
  });

  const horoscope = buildHoroscope(origin, hasBirthTime);

  const planets: PlanetPosition[] = [
    ...PLANET_KEYS.map((key) =>
      mapPlanet(horoscope.CelestialBodies[key], hasBirthTime),
    ),
    ...POINT_KEYS.filter((key) => horoscope.CelestialPoints[key]).map((key) =>
      mapPlanet(horoscope.CelestialPoints[key], hasBirthTime),
    ),
  ];

  const sun = planets.find((p) => p.name === "sun");
  const moon = planets.find((p) => p.name === "moon");

  if (!sun || !moon) {
    throw new Error("Не удалось рассчитать позиции Солнца или Луны");
  }

  const result: NatalChartResult = {
    planets,
    aspects: mapAspects(horoscope.Aspects.all, hasBirthTime),
    hasBirthTime,
    sunSign: sun.sign,
    moonSign: moon.sign,
  };

  if (hasBirthTime) {
    result.angles = [
      mapAngle(horoscope.Ascendant, "ascendant"),
      mapAngle(horoscope.Midheaven, "midheaven"),
    ];
    result.houses = mapHouses(horoscope.Houses);
    result.risingSign = result.angles[0].sign;
  }

  return result;
}
