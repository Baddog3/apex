export const ru = {
  app: {
    name: "Apex",
    tagline: "Астролог в кармане",
  },
  nav: {
    today: "Сегодня",
    chart: "Карта",
    compatibility: "Совместимость",
    chat: "Чат",
    profile: "Профиль",
  },
} as const;

export type I18nKey = typeof ru;
