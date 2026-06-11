import type { House } from "@/lib/astrology";
import { formatSignDegree } from "@/lib/chart/format";
import { Card } from "@/components/ui/Card";
import { t } from "@/lib/i18n";

interface ChartHousesListProps {
  houses: House[];
}

export function ChartHousesList({ houses }: ChartHousesListProps) {
  const strings = t();

  return (
    <Card title={strings.chart.housesTitle}>
      <div>
        {houses.map((house) => (
          <div
            key={house.number}
            className="flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-b-0"
          >
            <span className="text-muted">
              {strings.chart.houseNumber.replace("{n}", String(house.number))}
            </span>
            <span>{formatSignDegree(house.sign, house.degreeInSign)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
