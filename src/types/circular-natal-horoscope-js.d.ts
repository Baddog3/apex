declare module "circular-natal-horoscope-js" {
  interface OriginOptions {
    year: number;
    month: number;
    date: number;
    hour: number;
    minute: number;
    latitude: number;
    longitude: number;
  }

  interface HoroscopeOptions {
    origin: Origin;
    houseSystem: string;
    zodiac: string;
    aspectPoints: string[];
    aspectWithPoints: string[];
    aspectTypes: string[];
    customOrbs: Record<string, number>;
    language: string;
  }

  interface ChartEcliptic {
    DecimalDegrees: number;
    ArcDegreesFormatted30: string;
  }

  interface ChartPosition {
    Ecliptic: ChartEcliptic;
  }

  interface SignInfo {
    key: string;
    label: string;
  }

  interface CelestialBody {
    key: string;
    label: string;
    Sign: SignInfo;
    ChartPosition: ChartPosition;
    isRetrograde?: boolean;
    House?: { id: number };
  }

  interface HouseCusp {
    id: number;
    label: string;
    Sign: SignInfo;
    ChartPosition: {
      StartPosition: { Ecliptic: ChartEcliptic };
    };
  }

  interface AspectResult {
    point1Key: string;
    point2Key: string;
    aspectKey: string;
    orb: number;
  }

  export class Origin {
    constructor(options: OriginOptions);
  }

  export class Horoscope {
    constructor(options: HoroscopeOptions);
    CelestialBodies: Record<string, CelestialBody>;
    CelestialPoints: Record<string, CelestialBody>;
    Ascendant: CelestialBody;
    Midheaven: CelestialBody;
    Houses: HouseCusp[];
    Aspects: { all: AspectResult[] };
  }
}
