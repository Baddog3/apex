import { NextResponse } from "next/server";

import { signInWithTelegram } from "@/lib/auth/telegram-session";
import { verifyTelegramAuth, type TelegramAuthPayload } from "@/lib/auth/telegram";
import { t } from "@/lib/i18n";

function isTelegramPayload(value: unknown): value is TelegramAuthPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return (
    typeof payload.id === "number" &&
    typeof payload.first_name === "string" &&
    typeof payload.auth_date === "number" &&
    typeof payload.hash === "string"
  );
}

export async function POST(request: Request) {
  const strings = t();
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json(
      { error: strings.auth.telegramNotConfigured },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: strings.auth.authError }, { status: 400 });
  }

  if (!isTelegramPayload(body)) {
    return NextResponse.json({ error: strings.auth.authError }, { status: 400 });
  }

  if (!verifyTelegramAuth(body, botToken)) {
    return NextResponse.json({ error: strings.auth.telegramInvalid }, { status: 401 });
  }

  try {
    await signInWithTelegram(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: strings.auth.authError }, { status: 500 });
  }
}
