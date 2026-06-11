import { createHmac, createHash, timingSafeEqual } from "node:crypto";

const AUTH_MAX_AGE_SECONDS = 86_400;

export interface TelegramAuthPayload {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

function buildDataCheckString(payload: TelegramAuthPayload) {
  const entries = Object.entries(payload)
    .filter(([key, value]) => key !== "hash" && value !== undefined && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));

  return entries.map(([key, value]) => `${key}=${value}`).join("\n");
}

export function verifyTelegramAuth(
  payload: TelegramAuthPayload,
  botToken: string,
): boolean {
  const { hash, auth_date: authDate } = payload;

  if (!hash || !authDate) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > AUTH_MAX_AGE_SECONDS) {
    return false;
  }

  const secretKey = createHash("sha256").update(botToken).digest();
  const computedHash = createHmac("sha256", secretKey)
    .update(buildDataCheckString(payload))
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(computedHash, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

export function telegramAuthEmail(telegramId: number) {
  return `tg_${telegramId}@telegram.apex`;
}

export function displayNameFromTelegram(payload: TelegramAuthPayload) {
  return [payload.first_name, payload.last_name].filter(Boolean).join(" ");
}
