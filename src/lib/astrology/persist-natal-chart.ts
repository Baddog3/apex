import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/lib/db/types";

import {
  birthFingerprint,
  toBirthFingerprintInput,
} from "./birth-fingerprint";
import type { StoredChartData } from "./birth-fingerprint";
import { calculateNatalChart } from "./calculate";
import type { BirthData, NatalChartResult } from "./types";

export type PersistNatalChartError = "compute_failed" | "persist_failed";

export interface PersistNatalChartOptions {
  placeName?: string | null;
  name?: string | null;
  onboardingCompleted?: boolean;
}

export async function persistNatalChart(
  supabase: SupabaseClient<Database>,
  userId: string,
  birthData: BirthData,
  options: PersistNatalChartOptions = {},
): Promise<
  | { chart: NatalChartResult; error?: undefined }
  | { chart?: undefined; error: PersistNatalChartError }
> {
  let chart: NatalChartResult;
  try {
    chart = calculateNatalChart(birthData);
  } catch {
    return { error: "compute_failed" };
  }

  const fingerprint = birthFingerprint(toBirthFingerprintInput(birthData));
  const chartPayload: StoredChartData = {
    ...chart,
    _fingerprint: fingerprint,
  };

  const profileUpdate: Database["public"]["Tables"]["profiles"]["Update"] = {
    birth_date: birthData.date,
    birth_time: birthData.time ? `${birthData.time}:00` : null,
    birth_lat: birthData.lat,
    birth_lng: birthData.lng,
    birth_timezone: birthData.timezone,
    sun_sign: chart.sunSign,
    moon_sign: chart.moonSign,
    rising_sign: chart.risingSign ?? null,
  };

  if (options.placeName !== undefined) {
    profileUpdate.birth_place_name = options.placeName;
  }

  if (options.name !== undefined) {
    profileUpdate.name = options.name;
  }

  if (options.onboardingCompleted !== undefined) {
    profileUpdate.onboarding_completed = options.onboardingCompleted;
  }

  const [{ error: profileUpdateError }, { error: chartUpsertError }] =
    await Promise.all([
      supabase.from("profiles").update(profileUpdate).eq("id", userId),
      supabase.from("natal_charts").upsert(
        {
          user_id: userId,
          chart_data: chartPayload as unknown as Json,
          has_birth_time: chart.hasBirthTime,
          computed_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      ),
    ]);

  if (profileUpdateError || chartUpsertError) {
    return { error: "persist_failed" };
  }

  return { chart };
}
