import { NextResponse } from "next/server";

import { getUser } from "@/lib/auth/get-user";
import {
  birthFingerprint,
  calculateNatalChart,
  chartFromStored,
  profileToBirthFingerprint,
  toBirthFingerprintInput,
  type BirthData,
  type NatalChartResult,
  type StoredChartData,
} from "@/lib/astrology";
import { createClient } from "@/lib/db/server";
import type { Json } from "@/lib/db/types";
import { t } from "@/lib/i18n";

interface ComputeChartBody {
  date?: string;
  time?: string;
  lat?: number;
  lng?: number;
  timezone?: string;
  placeName?: string;
  force?: boolean;
}

function hasBirthDataInBody(body: ComputeChartBody): boolean {
  return (
    Boolean(body.date) &&
    body.lat != null &&
    body.lng != null &&
    Boolean(body.timezone)
  );
}

function bodyToBirthData(body: ComputeChartBody): BirthData {
  return {
    date: body.date!,
    time: body.time,
    lat: body.lat!,
    lng: body.lng!,
    timezone: body.timezone!,
  };
}

function profileToBirthData(profile: {
  birth_date: string | null;
  birth_time: string | null;
  birth_lat: number | null;
  birth_lng: number | null;
  birth_timezone: string | null;
}): BirthData | null {
  if (
    !profile.birth_date ||
    profile.birth_lat == null ||
    profile.birth_lng == null ||
    !profile.birth_timezone
  ) {
    return null;
  }

  return {
    date: profile.birth_date,
    time: profile.birth_time?.slice(0, 5) ?? undefined,
    lat: profile.birth_lat,
    lng: profile.birth_lng,
    timezone: profile.birth_timezone,
  };
}

export async function POST(request: Request) {
  const strings = t();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: strings.auth.authError }, { status: 401 });
  }

  let body: ComputeChartBody = {};
  try {
    body = (await request.json()) as ComputeChartBody;
  } catch {
    body = {};
  }

  const supabase = await createClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "birth_date, birth_time, birth_lat, birth_lng, birth_timezone, birth_place_name",
    )
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: strings.auth.authError }, { status: 500 });
  }

  const birthFromBody = hasBirthDataInBody(body) ? bodyToBirthData(body) : null;
  const birthFromProfile = profileToBirthData(profile);
  const birthData = birthFromBody ?? birthFromProfile;

  if (!birthData) {
    return NextResponse.json(
      { error: strings.astrology.chartMissingBirthData },
      { status: 400 },
    );
  }

  const fingerprint = birthFingerprint(toBirthFingerprintInput(birthData));

  if (!body.force && !birthFromBody) {
    const { data: existing } = await supabase
      .from("natal_charts")
      .select("chart_data, has_birth_time, computed_at")
      .eq("user_id", user.id)
      .maybeSingle();

    const stored = existing?.chart_data as StoredChartData | null | undefined;

    if (stored?._fingerprint === fingerprint) {
      return NextResponse.json({
        chart: chartFromStored(stored),
        cached: true,
        computedAt: existing?.computed_at,
      });
    }

    const profileFingerprint = profileToBirthFingerprint(profile);
    if (existing && profileFingerprint === fingerprint && !stored?._fingerprint) {
      const chart = chartFromStored(stored);
      return NextResponse.json({
        chart,
        cached: true,
        computedAt: existing.computed_at,
      });
    }
  }

  let chart: NatalChartResult;
  try {
    chart = calculateNatalChart(birthData);
  } catch {
    return NextResponse.json(
      { error: strings.astrology.chartComputeFailed },
      { status: 400 },
    );
  }

  const chartPayload: StoredChartData = {
    ...chart,
    _fingerprint: fingerprint,
  };

  const profileUpdate = {
    birth_date: birthData.date,
    birth_time: birthData.time ? `${birthData.time}:00` : null,
    birth_lat: birthData.lat,
    birth_lng: birthData.lng,
    birth_timezone: birthData.timezone,
    birth_place_name: body.placeName ?? profile.birth_place_name,
    sun_sign: chart.sunSign,
    moon_sign: chart.moonSign,
    rising_sign: chart.risingSign ?? null,
  };

  const [{ error: profileUpdateError }, { error: chartUpsertError }] =
    await Promise.all([
      supabase.from("profiles").update(profileUpdate).eq("id", user.id),
      supabase.from("natal_charts").upsert(
        {
          user_id: user.id,
          chart_data: chartPayload as unknown as Json,
          has_birth_time: chart.hasBirthTime,
          computed_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      ),
    ]);

  if (profileUpdateError || chartUpsertError) {
    return NextResponse.json(
      { error: strings.astrology.chartComputeFailed },
      { status: 500 },
    );
  }

  return NextResponse.json({ chart, cached: false });
}
