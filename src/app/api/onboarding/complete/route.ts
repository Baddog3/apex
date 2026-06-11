import { NextResponse } from "next/server";

import type { BirthData } from "@/lib/astrology";
import { persistNatalChart } from "@/lib/astrology/persist-natal-chart";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/db/server";
import { t } from "@/lib/i18n";
import { parseOnboardingCompleteBody } from "@/lib/onboarding/parse-body";

export async function POST(request: Request) {
  const strings = t();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: strings.auth.authError }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: strings.onboarding.invalidRequest },
      { status: 400 },
    );
  }

  const parsed = parseOnboardingCompleteBody(body, {
    nameRequired: strings.onboarding.nameRequired,
    nameTooLong: strings.onboarding.nameTooLong,
    birthDateRequired: strings.onboarding.birthDateRequired,
    birthDateFuture: strings.onboarding.birthDateFuture,
    birthDateTooOld: strings.onboarding.birthDateTooOld,
    cityRequired: strings.onboarding.cityRequired,
    birthTimeInvalid: strings.onboarding.birthTimeInvalid,
    invalidRequest: strings.onboarding.invalidRequest,
  });

  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data } = parsed;
  const birthData: BirthData = {
    date: data.birthDate,
    time: data.birthTime ?? undefined,
    lat: data.lat,
    lng: data.lng,
    timezone: data.timezone,
  };

  const supabase = await createClient();
  const result = await persistNatalChart(supabase, user.id, birthData, {
    name: data.name,
    placeName: data.placeName,
    onboardingCompleted: true,
  });

  if (result.error) {
    const status = result.error === "compute_failed" ? 400 : 500;
    return NextResponse.json(
      { error: strings.onboarding.saveFailed },
      { status },
    );
  }

  return NextResponse.json({ ok: true, chart: result.chart });
}
