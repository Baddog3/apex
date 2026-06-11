import { Horoscope, Origin } from "circular-natal-horoscope-js";

import { angularDistance, findAspect } from "./aspects";
import type { AspectType, NatalChartResult, PlanetKey } from "./types";

const TRANSIT_PLANETS: PlanetKey[] = [
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

export interface TransitAspect {
  transitPlanet: PlanetKey;
  natalBody: string;
  type: AspectType;
  orb: number;
}

function getTransitLongitudes(at: Date): Map<PlanetKey, number> {
  const origin = new Origin({
    year: at.getUTCFullYear(),
    month: at.getUTCMonth(),
    date: at.getUTCDate(),
    hour: at.getUTCHours(),
    minute: at.getUTCMinutes(),
    latitude: 0,
    longitude: 0,
  });

  const horoscope = new Horoscope({
    origin,
    houseSystem: "placidus",
    zodiac: "tropical",
    aspectPoints: ["bodies"],
    aspectWithPoints: ["bodies"],
    aspectTypes: ["major"],
    customOrbs: {},
    language: "en",
  });

  const positions = new Map<PlanetKey, number>();

  for (const key of TRANSIT_PLANETS) {
    positions.set(
      key,
      horoscope.CelestialBodies[key].ChartPosition.Ecliptic.DecimalDegrees,
    );
  }

  return positions;
}

/**
 * Активные транзиты: транзитная планета → натальное тело.
 */
export function calculateTransits(
  natal: NatalChartResult,
  at: Date = new Date(),
): TransitAspect[] {
  const transitPositions = getTransitLongitudes(at);

  const natalBodies: { name: string; longitude: number }[] = natal.planets
    .filter((planet) => TRANSIT_PLANETS.includes(planet.name as PlanetKey))
    .map((planet) => ({ name: planet.name, longitude: planet.longitude }));

  if (natal.angles) {
    natalBodies.push(
      ...natal.angles.map((angle) => ({
        name: angle.name,
        longitude: angle.longitude,
      })),
    );
  }

  const results: TransitAspect[] = [];

  for (const [transitPlanet, transitLon] of transitPositions) {
    for (const natalBody of natalBodies) {
      const separation = angularDistance(transitLon, natalBody.longitude);
      const aspect = findAspect(separation);

      if (aspect) {
        results.push({
          transitPlanet,
          natalBody: natalBody.name,
          type: aspect.type,
          orb: aspect.orb,
        });
      }
    }
  }

  return results.sort((a, b) => a.orb - b.orb);
}
