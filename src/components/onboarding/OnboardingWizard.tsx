"use client";

import { useState } from "react";

import { CityInput } from "@/components/CityInput";
import { Button, Input } from "@/components/ui";
import type { GeocodeResult } from "@/lib/geocoding";
import { t } from "@/lib/i18n";
import type { OnboardingData, OnboardingStep } from "@/lib/onboarding/types";
import {
  validateStep1,
  validateStep2,
  validateStep3,
} from "@/lib/onboarding/validation";

import { OnboardingProgress } from "./OnboardingProgress";

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function OnboardingWizard({
  onComplete,
  isSubmitting = false,
}: OnboardingWizardProps) {
  const strings = t();
  const onboarding = strings.onboarding;

  const [step, setStep] = useState<OnboardingStep>(1);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<GeocodeResult | null>(null);
  const [birthTime, setBirthTime] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const maxBirthDate = new Date().toISOString().slice(0, 10);

  function clearError(key: string) {
    setErrors((current) => {
      if (!current[key]) {
        return current;
      }
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function handleCityChange(value: string) {
    setCityQuery(value);
    if (selectedCity && value !== selectedCity.name) {
      setSelectedCity(null);
    }
    clearError("city");
  }

  function handleCitySelect(result: GeocodeResult) {
    setCityQuery(result.name);
    setSelectedCity(result);
    clearError("city");
  }

  function goToStep(nextStep: OnboardingStep) {
    setErrors({});
    setStep(nextStep);
  }

  function handleStep1Next() {
    const stepErrors = validateStep1(name, birthDate, {
      nameRequired: onboarding.nameRequired,
      nameTooLong: onboarding.nameTooLong,
      birthDateRequired: onboarding.birthDateRequired,
      birthDateFuture: onboarding.birthDateFuture,
      birthDateTooOld: onboarding.birthDateTooOld,
    });

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors as Record<string, string>);
      return;
    }

    goToStep(2);
  }

  function handleStep2Next() {
    const stepErrors = validateStep2(selectedCity !== null, {
      cityRequired: onboarding.cityRequired,
    });

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors as Record<string, string>);
      return;
    }

    goToStep(3);
  }

  async function submit(withTime: boolean) {
    if (!selectedCity) {
      return;
    }

    const timeValue = withTime ? birthTime : null;

    if (withTime) {
      const stepErrors = validateStep3(birthTime, {
        birthTimeRequired: onboarding.birthTimeRequired,
        birthTimeInvalid: onboarding.birthTimeInvalid,
      });

      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors as Record<string, string>);
        return;
      }
    }

    setErrors({});

    await onComplete({
      name: name.trim(),
      birthDate,
      city: selectedCity,
      birthTime: timeValue,
    });
  }

  const progressLabels: [string, string, string] = [
    onboarding.stepNameDate,
    onboarding.stepCity,
    onboarding.stepTime,
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex flex-1 flex-col justify-center px-6 py-10">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-10">
          <header className="flex flex-col items-center gap-6 text-center">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-medium uppercase tracking-widest">
                {onboarding.title}
              </h1>
              <p className="text-sm leading-relaxed text-muted">{onboarding.subtitle}</p>
            </div>
            <OnboardingProgress step={step} labels={progressLabels} />
            <p className="text-xs uppercase tracking-widest text-muted">
              {progressLabels[step - 1]}
            </p>
          </header>

          {step === 1 && (
            <div className="flex flex-col gap-6">
              <Input
                label={onboarding.nameLabel}
                name="name"
                autoComplete="given-name"
                placeholder={onboarding.namePlaceholder}
                value={name}
                disabled={isSubmitting}
                error={errors.name}
                onChange={(event) => {
                  setName(event.target.value);
                  clearError("name");
                }}
              />
              <Input
                label={onboarding.birthDateLabel}
                type="date"
                name="birthDate"
                max={maxBirthDate}
                min="1900-01-01"
                value={birthDate}
                disabled={isSubmitting}
                error={errors.birthDate}
                onChange={(event) => {
                  setBirthDate(event.target.value);
                  clearError("birthDate");
                }}
              />
            </div>
          )}

          {step === 2 && (
            <CityInput
              label={onboarding.cityLabel}
              value={cityQuery}
              disabled={isSubmitting}
              error={errors.city}
              onChange={handleCityChange}
              onSelect={handleCitySelect}
            />
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Input
                  label={onboarding.birthTimeLabel}
                  type="time"
                  name="birthTime"
                  value={birthTime}
                  disabled={isSubmitting}
                  error={errors.birthTime}
                  onChange={(event) => {
                    setBirthTime(event.target.value);
                    clearError("birthTime");
                  }}
                />
                <p className="text-xs leading-relaxed text-muted">
                  {onboarding.birthTimeHint}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="sticky bottom-0 border-t border-border bg-background px-6 py-4">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
          {step === 1 && (
            <Button type="button" fullWidth disabled={isSubmitting} onClick={handleStep1Next}>
              {onboarding.next}
            </Button>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3">
              <Button type="button" fullWidth disabled={isSubmitting} onClick={handleStep2Next}>
                {onboarding.next}
              </Button>
              <Button
                type="button"
                variant="ghost"
                fullWidth
                disabled={isSubmitting}
                onClick={() => goToStep(1)}
              >
                {onboarding.back}
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                fullWidth
                disabled={isSubmitting}
                onClick={() => submit(true)}
              >
                {isSubmitting ? onboarding.submitting : onboarding.finish}
              </Button>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                disabled={isSubmitting}
                onClick={() => submit(false)}
              >
                {onboarding.skipTime}
              </Button>
              <Button
                type="button"
                variant="ghost"
                fullWidth
                disabled={isSubmitting}
                onClick={() => goToStep(2)}
              >
                {onboarding.back}
              </Button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
