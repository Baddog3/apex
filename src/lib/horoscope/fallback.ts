import type { AspectType, PlanetKey } from "@/lib/astrology";
import type { TransitAspect } from "@/lib/astrology";
import { t } from "@/lib/i18n";

const TRANSIT_THEMES: Record<PlanetKey, string> = {
  sun: "идентичность и жизненная энергия",
  moon: "эмоции и внутренние реакции",
  mercury: "мысли и общение",
  venus: "отношения и удовольствие",
  mars: "действие и напряжение",
  jupiter: "рост и возможности",
  saturn: "границы и ответственность",
  uranus: "неожиданные перемены",
  neptune: "туман и иллюзии",
  pluto: "глубинные трансформации",
};

const ASPECT_TONE: Record<
  AspectType,
  { intro: string; advice: string }
> = {
  conjunction: {
    intro: "усиливает",
    advice: "Не размазывайся — выбери одну тему и проживи её осознанно.",
  },
  trine: {
    intro: "смягчает и открывает",
    advice: "Используй лёгкость дня, но не превращай её в оправдание бездействия.",
  },
  sextile: {
    intro: "подталкивает к возможностям в",
    advice: "Маленький шаг сейчас даст больше, чем идеальный план на потом.",
  },
  square: {
    intro: "создаёт трение вокруг",
    advice: "Раздражение — сигнал, а не приговор. Разберись, что именно давит.",
  },
  opposition: {
    intro: "высвечивает полярность в",
    advice: "Тебя тянет в разные стороны — не обязательно выбирать крайность.",
  },
  quincunx: {
    intro: "сбивает с ритма в",
    advice: "День может казаться нелогичным. Не требуй от себя идеальной ясности.",
  },
};

function planetLabel(name: string): string {
  const strings = t();
  return (
    strings.astrology.planets[name as keyof typeof strings.astrology.planets] ??
    name
  );
}

export function pickMainTransit(transits: TransitAspect[]): TransitAspect | null {
  return transits[0] ?? null;
}

export function fallbackHoroscopeText(
  mainTransit: TransitAspect | null,
  userName?: string | null,
): string {
  const strings = t();
  const greeting = userName?.trim()
    ? `${userName.trim()}, `
    : "";

  if (!mainTransit) {
    return strings.horoscope.calmDay.replace("{name}", greeting);
  }

  const transitPlanet = mainTransit.transitPlanet as PlanetKey;
  const theme = TRANSIT_THEMES[transitPlanet] ?? "текущие процессы";
  const tone = ASPECT_TONE[mainTransit.type];
  const natal = planetLabel(mainTransit.natalBody).toLowerCase();
  const transit = planetLabel(mainTransit.transitPlanet);

  return (
    `${greeting}транзитный ${transit} ${tone.intro} твоей натальной ${natal} — тема дня: ${theme}. ` +
    `${tone.advice}`
  );
}
