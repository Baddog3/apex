export const APP_TABS = [
  { href: "/today", key: "today" },
  { href: "/chart", key: "chart" },
  { href: "/compatibility", key: "compatibility" },
  { href: "/chat", key: "chat" },
  { href: "/profile", key: "profile" },
] as const;

export type AppTabKey = (typeof APP_TABS)[number]["key"];
