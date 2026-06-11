import { NextResponse } from "next/server";

import { getUser } from "@/lib/auth/get-user";
import { getTodayHoroscope } from "@/lib/horoscope/get-today-horoscope";
import { t } from "@/lib/i18n";

export async function GET() {
  const strings = t();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: strings.auth.authError }, { status: 401 });
  }

  const result = await getTodayHoroscope(user.id);

  if (!result.ok) {
    if (result.error === "no_chart") {
      return NextResponse.json(
        { error: strings.astrology.chartMissingBirthData },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: strings.horoscope.generateFailed },
      { status: 500 },
    );
  }

  return NextResponse.json(result.horoscope);
}
