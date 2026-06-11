import type { NatalChartResult } from "@/lib/astrology";
import { chartToPrompt } from "@/lib/astrology";
import type { TransitAspect } from "@/lib/astrology";

const SYSTEM_PROMPT = `Ты астролог в стиле Co-Star: прямо, честно, без слащавого позитива и эзотерической воды.
Пиши только на русском. 2–3 коротких предложения.
Интерпретируй только переданные данные карты и транзитов — не выдумывай позиции планет.
Не используй списки, эмодзи и обращение «дорогой/дорогая».`;

export function buildHoroscopeMessages(
  chart: NatalChartResult,
  transits: TransitAspect[],
  userName?: string | null,
): { role: "system" | "user"; content: string }[] {
  const context = chartToPrompt(chart, transits);
  const nameLine = userName?.trim()
    ? `Имя пользователя: ${userName.trim()}\n`
    : "";

  return [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content:
        `${nameLine}` +
        "Составь персональный гороскоп на сегодня по этим данным:\n\n" +
        context,
    },
  ];
}
