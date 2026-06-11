import {
  chartFromStored,
  type NatalChartResult,
  type StoredChartData,
} from "@/lib/astrology";
import { createClient } from "@/lib/db/server";

export async function getUserNatalChart(
  userId: string,
): Promise<NatalChartResult | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("natal_charts")
    .select("chart_data")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return chartFromStored(data.chart_data as unknown as StoredChartData);
}
