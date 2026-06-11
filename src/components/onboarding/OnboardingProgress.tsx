import type { OnboardingStep } from "@/lib/onboarding/types";

interface OnboardingProgressProps {
  step: OnboardingStep;
  labels: [string, string, string];
}

export function OnboardingProgress({ step, labels }: OnboardingProgressProps) {
  const steps: OnboardingStep[] = [1, 2, 3];

  return (
    <div
      className="flex items-center justify-center gap-3"
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={1}
      aria-valuemax={3}
      aria-label={`${labels[step - 1]}, шаг ${step} из 3`}
    >
      {steps.map((index) => {
        const isActive = index === step;
        const isComplete = index < step;

        return (
          <span
            key={index}
            className={[
              "h-2 w-2 rounded-full transition-colors",
              isActive || isComplete ? "bg-foreground" : "bg-border",
            ].join(" ")}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}
