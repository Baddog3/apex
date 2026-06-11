import { createAdminClient } from "@/lib/db/admin";
import { createClient } from "@/lib/db/server";

import {
  displayNameFromTelegram,
  telegramAuthEmail,
  type TelegramAuthPayload,
} from "./telegram";

function isExistingUserError(message: string) {
  return message.toLowerCase().includes("already");
}

async function establishSession(email: string) {
  const admin = createAdminClient();
  const supabase = await createClient();

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  const tokenHash = linkData.properties?.hashed_token;
  if (linkError || !tokenHash) {
    throw linkError ?? new Error("Failed to generate auth link");
  }

  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: "email",
    token_hash: tokenHash,
  });

  if (verifyError) {
    throw verifyError;
  }

  return linkData.user?.id ?? null;
}

export async function signInWithTelegram(payload: TelegramAuthPayload) {
  const admin = createAdminClient();
  const email = telegramAuthEmail(payload.id);
  const displayName = displayNameFromTelegram(payload);

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("telegram_id", payload.id)
    .maybeSingle();

  if (!existingProfile) {
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        telegram_id: payload.id,
        telegram_username: payload.username ?? null,
        full_name: displayName,
      },
    });

    if (createError && !isExistingUserError(createError.message)) {
      throw createError;
    }
  }

  const userId = await establishSession(email);

  if (userId) {
    await admin
      .from("profiles")
      .update({
        telegram_id: payload.id,
        name: displayName || null,
      })
      .eq("id", userId);
  } else if (existingProfile) {
    await admin
      .from("profiles")
      .update({ name: displayName || null })
      .eq("id", existingProfile.id);
  }
}
