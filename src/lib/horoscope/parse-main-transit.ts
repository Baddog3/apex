import type { TransitAspect } from "@/lib/astrology";
import type { Json } from "@/lib/db/types";

export function parseMainTransit(value: Json | null): TransitAspect | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const row = value as Record<string, unknown>;
  const { transitPlanet, natalBody, type, orb } = row;

  if (
    typeof transitPlanet !== "string" ||
    typeof natalBody !== "string" ||
    typeof type !== "string" ||
    typeof orb !== "number"
  ) {
    return null;
  }

  return {
    transitPlanet: transitPlanet as TransitAspect["transitPlanet"],
    natalBody,
    type: type as TransitAspect["type"],
    orb,
  };
}
