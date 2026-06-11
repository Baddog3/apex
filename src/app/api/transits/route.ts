import { NextResponse } from "next/server";

import { getUser } from "@/lib/auth/get-user";
import {
  calculateTransits,
  chartFromStored,
  type StoredChartData,
  type TransitAspect,
} from "@/lib/astrology";
import { createClient } from "@/lib/db/server";
import { t } from "@/lib/i18n";

function parseTransitDate(value: string | null): Date | null {
  if (!value) {
    return new Date();
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);

  return new Date(Date.UTC(year, month, day, 12, 0, 0));
}

export async function GET(request: Request) {
  const strings = t();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: strings.auth.authError }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestedUserId = searchParams.get("userId");

  if (requestedUserId && requestedUserId !== user.id) {
    return NextResponse.json({ error: strings.auth.authError }, { status: 403 });
  }

  const at = parseTransitDate(searchParams.get("date"));
  if (!at) {
    return NextResponse.json(
      { error: strings.astrology.chartMissingBirthData },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("natal_charts")
    .select("chart_data")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !row) {
    return NextResponse.json(
      { error: strings.astrology.chartMissingBirthData },
      { status: 404 },
    );
  }

  const stored = row.chart_data as unknown as StoredChartData;
  const transits: TransitAspect[] = calculateTransits(chartFromStored(stored), at);

  return NextResponse.json({
    transits,
    date: at.toISOString().slice(0, 10),
  });
}
