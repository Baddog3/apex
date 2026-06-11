import {
  chartFromStored,
  type StoredChartData,
} from "@/lib/astrology";
import { createAdminClient } from "@/lib/db/admin";
import { createClient } from "@/lib/db/server";
import type { HoroscopeSource, Json } from "@/lib/db/types";

import { getLocalDateString } from "./date";
import { formatMainTransitLabel } from "./format-transit";
import { generateHoroscopeContent, toTodayHoroscope } from "./generate";
import { parseMainTransit } from "./parse-main-transit";
import type { TodayHoroscope } from "./types";

export type GetTodayHoroscopeError = "no_chart" | "persist_failed";

export type GetTodayHoroscopeResult =
  | { ok: true; horoscope: TodayHoroscope }
  | { ok: false; error: GetTodayHoroscopeError };

export async function getTodayHoroscope(
  userId: string,
): Promise<GetTodayHoroscopeResult> {
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("name, birth_timezone")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return { ok: false, error: "no_chart" };
  }

  const { data: chartRow, error: chartError } = await supabase
    .from("natal_charts")
    .select("chart_data")
    .eq("user_id", userId)
    .maybeSingle();

  if (chartError || !chartRow) {
    return { ok: false, error: "no_chart" };
  }

  const stored = chartRow.chart_data as unknown as StoredChartData;
  const chart = chartFromStored(stored);
  const fingerprint = stored._fingerprint ?? "";
  const timezone = profile.birth_timezone ?? "Europe/Moscow";
  const today = getLocalDateString(timezone);

  const { data: cached } = await supabase
    .from("daily_horoscopes")
    .select("text, main_transit, chart_fingerprint, source")
    .eq("user_id", userId)
    .eq("horoscope_date", today)
    .maybeSingle();

  if (cached && cached.chart_fingerprint === fingerprint) {
    const mainTransit = parseMainTransit(cached.main_transit);

    return {
      ok: true,
      horoscope: toTodayHoroscope(
        {
          text: cached.text,
          mainTransit,
          mainTransitLabel: formatMainTransitLabel(mainTransit),
          source: cached.source as HoroscopeSource,
        },
        today,
        true,
      ),
    };
  }

  const generated = await generateHoroscopeContent({
    chart,
    date: today,
    userName: profile.name,
  });

  const admin = createAdminClient();
  const { error: persistError } = await admin.from("daily_horoscopes").upsert(
    {
      user_id: userId,
      horoscope_date: today,
      text: generated.text,
      main_transit: (generated.mainTransit as unknown as Json) ?? null,
      chart_fingerprint: fingerprint,
      source: generated.source,
    },
    { onConflict: "user_id,horoscope_date" },
  );

  if (persistError) {
    return { ok: false, error: "persist_failed" };
  }

  return {
    ok: true,
    horoscope: toTodayHoroscope(generated, today, false),
  };
}
