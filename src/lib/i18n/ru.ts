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
  auth: {
    loginTitle: "Вход",
    loginSubtitle: "Ссылка для входа придёт на email",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    sendLink: "Отправить ссылку",
    sending: "Отправляем…",
    checkEmail: "Проверь почту",
    checkEmailHint: "Мы отправили ссылку для входа на {email}",
    backToLogin: "Другой email",
    authError: "Не удалось войти. Попробуй снова.",
    invalidEmail: "Введи корректный email",
    orDivider: "или",
    telegramSigningIn: "Входим через Telegram…",
    telegramInvalid: "Неверная подпись Telegram",
    telegramNotConfigured: "Telegram-вход не настроен",
  },
  today: {
    greeting: "Привет",
    empty: "Здесь скоро будет твой гороскоп на сегодня.",
  },
  chart: {
    empty: "Здесь появится твоя натальная карта.",
  },
  compatibility: {
    empty: "Добавь человека, чтобы узнать совместимость.",
  },
  chat: {
    empty: "Здесь будет диалог с AI-астрологом.",
  },
  profile: {
    empty: "Настройки профиля и подписка — скоро.",
    signOut: "Выйти",
  },
} as const;

export type I18nKey = typeof ru;
