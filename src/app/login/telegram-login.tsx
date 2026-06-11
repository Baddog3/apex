"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import type { TelegramAuthPayload } from "@/lib/auth/telegram";
import { t } from "@/lib/i18n";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

export function TelegramLogin() {
  const strings = t();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTelegramAuth = useCallback(
    async (user: TelegramAuthPayload) => {
      setError(null);
      setLoading(true);

      try {
        const response = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });

        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          setError(data.error ?? strings.auth.authError);
          return;
        }

        router.push("/today");
        router.refresh();
      } catch {
        setError(strings.auth.authError);
      } finally {
        setLoading(false);
      }
    },
    [router, strings.auth.authError],
  );

  useEffect(() => {
    window.onTelegramAuth = handleTelegramAuth;
    return () => {
      delete window.onTelegramAuth;
    };
  }, [handleTelegramAuth]);

  if (!BOT_USERNAME) {
    return (
      <p className="text-center text-xs text-muted">{strings.auth.telegramNotConfigured}</p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Script
        src="https://telegram.org/js/telegram-widget.js?22"
        strategy="lazyOnload"
        data-telegram-login={BOT_USERNAME}
        data-size="large"
        data-radius="0"
        data-onauth="onTelegramAuth(user)"
        data-request-access="write"
      />
      {loading && <p className="text-xs text-muted">{strings.auth.telegramSigningIn}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramAuthPayload) => void;
  }
}
