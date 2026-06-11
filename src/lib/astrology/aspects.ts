import type { AspectType } from "./types";

const ASPECT_ANGLES: Record<AspectType, number> = {
  conjunction: 0,
  opposition: 180,
  trine: 120,
  square: 90,
  sextile: 60,
  quincunx: 150,
};

const ASPECT_ORBS: Record<AspectType, number> = {
  conjunction: 8,
  opposition: 8,
  trine: 8,
  square: 7,
  sextile: 6,
  quincunx: 5,
};

export function angularDistance(lon1: number, lon2: number): number {
  const diff = Math.abs(lon1 - lon2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

export function findAspect(
  separation: number,
): { type: AspectType; orb: number } | null {
  let best: { type: AspectType; orb: number } | null = null;

  for (const type of Object.keys(ASPECT_ANGLES) as AspectType[]) {
    const target = ASPECT_ANGLES[type];
    const orbLimit = ASPECT_ORBS[type];
    const orb = Math.abs(separation - target);

    if (orb <= orbLimit && (!best || orb < best.orb)) {
      best = { type, orb: Math.round(orb * 10) / 10 };
    }
  }

  return best;
}
