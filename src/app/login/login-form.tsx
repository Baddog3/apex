"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button, Input } from "@/components/ui";
import { createClient } from "@/lib/db/client";
import { t } from "@/lib/i18n";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const strings = t();
  const searchParams = useSearchParams();
  const authErrorFromUrl = searchParams.get("error") === "auth";
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(
    authErrorFromUrl ? strings.auth.authError : null,
  );
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError(strings.auth.invalidEmail);
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (signInError) {
      setError(strings.auth.authError);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-6 text-center">
        <div>
          <h2 className="text-lg font-medium uppercase tracking-widest">
            {strings.auth.checkEmail}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {strings.auth.checkEmailHint.replace("{email}", email.trim())}
          </p>
        </div>
        <Button variant="ghost" type="button" onClick={() => setSent(false)}>
          {strings.auth.backToLogin}
        </Button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <Input
        label={strings.auth.emailLabel}
        type="email"
        name="email"
        autoComplete="email"
        placeholder={strings.auth.emailPlaceholder}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={error ?? undefined}
        disabled={loading}
        required
      />
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? strings.auth.sending : strings.auth.sendLink}
      </Button>
    </form>
  );
}
