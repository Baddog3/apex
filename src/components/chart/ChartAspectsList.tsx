import type { Aspect } from "@/lib/astrology";
import { formatAspectLine } from "@/lib/chart/format";
import { Card } from "@/components/ui/Card";
import { t } from "@/lib/i18n";

interface ChartAspectsListProps {
  aspects: Aspect[];
}

export function ChartAspectsList({ aspects }: ChartAspectsListProps) {
  const strings = t();

  if (aspects.length === 0) {
    return (
      <Card title={strings.chart.aspectsTitle}>
        <p className="text-sm text-muted">{strings.chart.noAspects}</p>
      </Card>
    );
  }

  return (
    <Card title={strings.chart.aspectsTitle}>
      <div>
        {aspects.map((aspect, index) => (
          <p
            key={`${aspect.body1}-${aspect.body2}-${aspect.type}-${index}`}
            className="border-b border-border py-3 font-mono text-sm last:border-b-0"
          >
            {formatAspectLine(aspect.body1, aspect.body2, aspect.type, aspect.orb)}
          </p>
        ))}
      </div>
    </Card>
  );
}
