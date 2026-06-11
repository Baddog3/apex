import type { HoroscopeSource } from "@/lib/db/types";

import type { TransitAspect } from "@/lib/astrology";

export interface TodayHoroscope {
  date: string;
  text: string;
  mainTransit: TransitAspect | null;
  mainTransitLabel: string | null;
  source: HoroscopeSource;
  cached: boolean;
}
