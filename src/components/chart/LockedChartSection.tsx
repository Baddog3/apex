import { PremiumBadge } from "@/components/PremiumBadge";
import { Card } from "@/components/ui/Card";
import type { ChartLockReason } from "@/lib/chart/access";
import { t } from "@/lib/i18n";

interface LockedChartSectionProps {
  title: string;
  lockReason: ChartLockReason;
}

export function LockedChartSection({ title, lockReason }: LockedChartSectionProps) {
  const strings = t();
  const description =
    lockReason === "no_birth_time"
      ? strings.chart.lockedBirthTime
      : strings.chart.lockedPremium;

  return (
    <Card title={title}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm leading-relaxed text-muted">{description}</p>
        {lockReason === "premium" && <PremiumBadge />}
      </div>
    </Card>
  );
}
