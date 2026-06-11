import type { GeocodeResult } from "@/lib/geocoding";

export interface OnboardingData {
  name: string;
  birthDate: string;
  city: GeocodeResult;
  birthTime: string | null;
}

export type OnboardingStep = 1 | 2 | 3;
