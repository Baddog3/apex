import type { SubscriptionTier } from "@/types";

export type ChartLockReason = "no_birth_time" | "premium";

export interface ChartSectionAccess {
  unlocked: boolean;
  lockReason: ChartLockReason | null;
}

export interface ChartAccess {
  wheel: {
    showHouses: boolean;
    showAspects: boolean;
  };
  houses: ChartSectionAccess;
  aspects: ChartSectionAccess;
}

export function getChartAccess(
  subscriptionTier: SubscriptionTier,
  hasBirthTime: boolean,
): ChartAccess {
  const isPremium = subscriptionTier === "premium";

  if (!hasBirthTime) {
    return {
      wheel: { showHouses: false, showAspects: false },
      houses: { unlocked: false, lockReason: "no_birth_time" },
      aspects: { unlocked: false, lockReason: "no_birth_time" },
    };
  }

  if (!isPremium) {
    return {
      wheel: { showHouses: false, showAspects: false },
      houses: { unlocked: false, lockReason: "premium" },
      aspects: { unlocked: false, lockReason: "premium" },
    };
  }

  return {
    wheel: { showHouses: true, showAspects: true },
    houses: { unlocked: true, lockReason: null },
    aspects: { unlocked: true, lockReason: null },
  };
}
