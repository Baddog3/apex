import type { BirthData, NatalChartResult } from "./types";

export interface StoredChartData extends NatalChartResult {
  _fingerprint?: string;
}

export function chartFromStored(data: StoredChartData): NatalChartResult {
  const { _fingerprint: fingerprint, ...chart } = data;
  void fingerprint;
  return chart;
}

export interface BirthFingerprintInput {
  date: string;
  time?: string | null;
  lat: number;
  lng: number;
  timezone: string;
}

export function toBirthFingerprintInput(
  data: BirthData,
): BirthFingerprintInput {
  return {
    date: data.date,
    time: data.time ?? null,
    lat: data.lat,
    lng: data.lng,
    timezone: data.timezone,
  };
}

export function birthFingerprint(data: BirthFingerprintInput): string {
  return JSON.stringify({
    date: data.date,
    time: data.time ?? null,
    lat: data.lat,
    lng: data.lng,
    timezone: data.timezone,
  });
}

export function profileToBirthFingerprint(profile: {
  birth_date: string | null;
  birth_time: string | null;
  birth_lat: number | null;
  birth_lng: number | null;
  birth_timezone: string | null;
}): string | null {
  if (
    !profile.birth_date ||
    profile.birth_lat == null ||
    profile.birth_lng == null ||
    !profile.birth_timezone
  ) {
    return null;
  }

  return birthFingerprint({
    date: profile.birth_date,
    time: profile.birth_time,
    lat: profile.birth_lat,
    lng: profile.birth_lng,
    timezone: profile.birth_timezone,
  });
}
