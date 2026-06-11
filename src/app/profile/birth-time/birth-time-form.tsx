"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Input } from "@/components/ui";
import { t } from "@/lib/i18n";

export function BirthTimeForm() {
  const strings = t();
  const router = useRouter();
  const birthTime = strings.birthTime;

  const [time, setTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!time) {
      setError(birthTime.timeRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/profile/birth-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? birthTime.saveFailed);
        return;
      }

      router.push("/chart");
      router.refresh();
    } catch {
      setError(birthTime.saveFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <Input
        label={birthTime.timeLabel}
        type="time"
        name="birthTime"
        value={time}
        disabled={isSubmitting}
        error={error ?? undefined}
        onChange={(event) => {
          setTime(event.target.value);
          setError(null);
        }}
      />
      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? birthTime.saving : birthTime.save}
      </Button>
      <Link
        href="/profile"
        className="text-center text-xs uppercase tracking-widest text-muted transition-colors hover:text-foreground"
      >
        {birthTime.back}
      </Link>
    </form>
  );
}
