import { NextResponse } from "next/server";

import { persistNatalChart } from "@/lib/astrology/persist-natal-chart";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/db/server";
import { t } from "@/lib/i18n";

interface BirthTimeBody {
  time?: string;
}

function isValidTime(value: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    return false;
  }

  const [hours, minutes] = value.split(":").map(Number);
  return hours <= 23 && minutes <= 59;
}

export async function POST(request: Request) {
  const strings = t();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: strings.auth.authError }, { status: 401 });
  }

  let body: BirthTimeBody;
  try {
    body = (await request.json()) as BirthTimeBody;
  } catch {
    return NextResponse.json(
      { error: strings.birthTime.invalidRequest },
      { status: 400 },
    );
  }

  const time = typeof body.time === "string" ? body.time.trim() : "";
  if (!isValidTime(time)) {
    return NextResponse.json(
      { error: strings.birthTime.invalidTime },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "birth_date, birth_time, birth_lat, birth_lng, birth_timezone, birth_place_name, onboarding_completed",
    )
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: strings.birthTime.saveFailed }, { status: 500 });
  }

  if (!profile.onboarding_completed) {
    return NextResponse.json({ error: strings.birthTime.notReady }, { status: 400 });
  }

  if (
    !profile.birth_date ||
    profile.birth_lat == null ||
    profile.birth_lng == null ||
    !profile.birth_timezone
  ) {
    return NextResponse.json({ error: strings.birthTime.missingBirthData }, { status: 400 });
  }

  const result = await persistNatalChart(
    supabase,
    user.id,
    {
      date: profile.birth_date,
      time,
      lat: profile.birth_lat,
      lng: profile.birth_lng,
      timezone: profile.birth_timezone,
    },
    {
      placeName: profile.birth_place_name,
    },
  );

  if (result.error) {
    const status = result.error === "compute_failed" ? 400 : 500;
    return NextResponse.json({ error: strings.birthTime.saveFailed }, { status });
  }

  return NextResponse.json({ ok: true, chart: result.chart });
}
