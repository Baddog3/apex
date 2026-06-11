import type { NatalChartResult } from "@/lib/astrology";
import type { ChartAccess } from "@/lib/chart/access";
import { t } from "@/lib/i18n";

import { ChartAspectsList } from "./ChartAspectsList";
import { ChartHousesList } from "./ChartHousesList";
import { ChartPlanetList } from "./ChartPlanetList";
import { LockedChartSection } from "./LockedChartSection";
import { NatalChartWheel } from "./NatalChartWheel";

interface ChartViewProps {
  chart: NatalChartResult;
  access: ChartAccess;
}

export function ChartView({ chart, access }: ChartViewProps) {
  const strings = t();

  return (
    <div className="flex flex-col gap-8">
      <NatalChartWheel
        chart={chart}
        showHouses={access.wheel.showHouses}
        showAspects={access.wheel.showAspects}
      />

      <ChartPlanetList chart={chart} showHouseNumbers={access.houses.unlocked} />

      {access.houses.unlocked && chart.houses ? (
        <ChartHousesList houses={chart.houses} />
      ) : (
        access.houses.lockReason === "no_birth_time" &&
        access.aspects.lockReason === "no_birth_time" && (
          <LockedChartSection
            title={`${strings.chart.housesTitle} и ${strings.chart.aspectsTitle}`}
            lockReason="no_birth_time"
          />
        )
      )}

      {access.houses.lockReason === "premium" && (
        <LockedChartSection
          title={strings.chart.housesTitle}
          lockReason="premium"
        />
      )}

      {access.aspects.unlocked ? (
        <ChartAspectsList aspects={chart.aspects} />
      ) : (
        access.aspects.lockReason === "premium" && (
          <LockedChartSection
            title={strings.chart.aspectsTitle}
            lockReason="premium"
          />
        )
      )}
    </div>
  );
}
