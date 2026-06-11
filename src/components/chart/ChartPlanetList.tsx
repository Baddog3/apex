import type { NatalChartResult } from "@/lib/astrology";
import { bodyLabel } from "@/lib/chart/format";
import { t } from "@/lib/i18n";

import { ChartPositionRow } from "./ChartPositionRow";

const OTHER_PLANET_ORDER = [
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "northnode",
  "southnode",
  "lilith",
] as const;

interface ChartPlanetListProps {
  chart: NatalChartResult;
  showHouseNumbers: boolean;
}

export function ChartPlanetList({ chart, showHouseNumbers }: ChartPlanetListProps) {
  const strings = t();
  const sun = chart.planets.find((planet) => planet.name === "sun");
  const moon = chart.planets.find((planet) => planet.name === "moon");
  const ascendant = chart.angles?.find((angle) => angle.name === "ascendant");

  const otherPlanets = OTHER_PLANET_ORDER.map((name) =>
    chart.planets.find((planet) => planet.name === name),
  ).filter((planet): planet is NonNullable<typeof planet> => Boolean(planet));

  function houseMeta(house?: number): string | undefined {
    if (!showHouseNumbers || !house) {
      return undefined;
    }

    return strings.chart.houseNumber.replace("{n}", String(house));
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-2 text-xs uppercase tracking-widest text-muted">
          {strings.chart.bigThreeTitle}
        </h2>
        <div className="border border-border px-4">
          {sun && (
            <ChartPositionRow
              label={bodyLabel("sun")}
              sign={sun.sign}
              degreeInSign={sun.degreeInSign}
              highlighted
              meta={
                sun.retrograde
                  ? strings.chart.retrograde
                  : houseMeta(sun.house)
              }
            />
          )}
          {moon && (
            <ChartPositionRow
              label={bodyLabel("moon")}
              sign={moon.sign}
              degreeInSign={moon.degreeInSign}
              highlighted
              meta={
                moon.retrograde
                  ? strings.chart.retrograde
                  : houseMeta(moon.house)
              }
            />
          )}
          {ascendant ? (
            <ChartPositionRow
              label={bodyLabel("ascendant")}
              sign={ascendant.sign}
              degreeInSign={ascendant.degreeInSign}
              highlighted
            />
          ) : (
            <div className="border-b border-border py-3 last:border-b-0">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-medium text-muted">{bodyLabel("ascendant")}</span>
                <span className="text-sm text-muted">{strings.chart.ascendantMissing}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs uppercase tracking-widest text-muted">
          {strings.chart.planetsTitle}
        </h2>
        <div className="border border-border px-4">
          {otherPlanets.map((planet) => (
            <ChartPositionRow
              key={planet.name}
              label={bodyLabel(planet.name)}
              sign={planet.sign}
              degreeInSign={planet.degreeInSign}
              meta={
                planet.retrograde
                  ? strings.chart.retrograde
                  : houseMeta(planet.house)
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}
