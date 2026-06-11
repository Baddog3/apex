/** Размер viewBox SVG-колеса. */
export const WHEEL_SIZE = 400;

export const WHEEL_CENTER = WHEEL_SIZE / 2;

/**
 * Угол на колесе в градусах (SVG: 0° — вправо, по часовой).
 * Асцендент (или 0° Овна без времени) — слева (9 ч).
 */
export function longitudeToWheelAngle(
  longitude: number,
  ascendantLongitude: number | null,
): number {
  const asc = ascendantLongitude ?? 0;
  return 180 + (longitude - asc);
}

export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(rad),
    y: centerY + radius * Math.sin(rad),
  };
}
