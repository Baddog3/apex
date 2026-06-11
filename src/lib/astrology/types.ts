/** Ключи знаков зодиака (тропический, lowercase). */
export type ZodiacSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export type PlanetKey =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

export type PointKey = "northnode" | "southnode" | "lilith";

export type AspectType =
  | "conjunction"
  | "opposition"
  | "trine"
  | "square"
  | "sextile"
  | "quincunx";

export interface BirthData {
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM (локальное время места рождения) */
  time?: string;
  lat: number;
  lng: number;
  /** IANA timezone, например Europe/Moscow — хранится для профиля; расчёт по lat/lng */
  timezone: string;
}

export interface PlanetPosition {
  name: PlanetKey | PointKey;
  longitude: number;
  sign: ZodiacSign;
  degreeInSign: number;
  house?: number;
  retrograde: boolean;
}

export interface AnglePosition {
  name: "ascendant" | "midheaven";
  longitude: number;
  sign: ZodiacSign;
  degreeInSign: number;
}

export interface House {
  number: number;
  sign: ZodiacSign;
  longitude: number;
  degreeInSign: number;
}

export interface Aspect {
  body1: string;
  body2: string;
  type: AspectType;
  orb: number;
}

export interface NatalChartResult {
  planets: PlanetPosition[];
  angles?: AnglePosition[];
  houses?: House[];
  aspects: Aspect[];
  hasBirthTime: boolean;
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  risingSign?: ZodiacSign;
}
