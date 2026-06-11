import { NextResponse } from "next/server";

import { getUser } from "@/lib/auth/get-user";
import {
  birthFingerprint,
  chartFromStored,
  profileToBirthFingerprint,
  toBirthFingerprintInput,
  type BirthData,
  type StoredChartData,
} from "@/lib/astrology";
import { persistNatalChart } from "@/lib/astrology/persist-natal-chart";
import { createClient } from "@/lib/db/server";
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
    if (
      existing &&
      stored &&
      profileFingerprint === fingerprint &&
      !stored._fingerprint
    ) {
      const chart = chartFromStored(stored);
      return NextResponse.json({
        chart,
        cached: true,
        computedAt: existing.computed_at,
      });
    }
  }

  const result = await persistNatalChart(supabase, user.id, birthData, {
    placeName: body.placeName ?? profile.birth_place_name,
  });

  if (result.error) {
    const status = result.error === "compute_failed" ? 400 : 500;
    return NextResponse.json(
      { error: strings.astrology.chartComputeFailed },
      { status },
    );
  }

  return NextResponse.json({ chart: result.chart, cached: false });
}
