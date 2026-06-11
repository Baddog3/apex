"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { Layout } from "@/components/ui";
import { t } from "@/lib/i18n";
import type { OnboardingData } from "@/lib/onboarding/types";

export default function OnboardingPage() {
  const strings = t();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleComplete(data: OnboardingData) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          birthDate: data.birthDate,
          birthTime: data.birthTime,
          lat: data.city.lat,
          lng: data.city.lng,
          timezone: data.city.timezone,
          placeName: data.city.name,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setSubmitError(payload.error ?? strings.onboarding.saveFailed);
        return;
      }

      router.push("/today");
      router.refresh();
    } catch {
      setSubmitError(strings.onboarding.saveFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Layout showNav={false}>
      {submitError && (
        <p className="px-6 pt-6 text-center text-sm text-red-400" role="alert">
          {submitError}
        </p>
      )}
      <OnboardingWizard onComplete={handleComplete} isSubmitting={isSubmitting} />
    </Layout>
  );
}
