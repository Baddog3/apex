import type { NatalChartResult } from "@/lib/astrology";
import {
  longitudeToWheelAngle,
  polarToCartesian,
  WHEEL_CENTER,
  WHEEL_SIZE,
} from "@/lib/chart/geometry";
import { getBodySymbol } from "@/lib/chart/planet-symbols";
import { ZODIAC_SIGNS } from "@/lib/chart/zodiac-order";
import { t } from "@/lib/i18n";

const R_OUTER = 188;
const R_INNER = 118;
const R_ASPECT = 96;
const R_PLANET = 142;

/** Небольшой радиальный сдвиг, чтобы символы реже накладывались. */
const PLANET_RADIUS_OFFSET: Record<string, number> = {
  sun: 0,
  moon: 0,
  mercury: -10,
  venus: -6,
  mars: -12,
  jupiter: 8,
  saturn: 12,
  uranus: 16,
  neptune: 16,
  pluto: 16,
  northnode: 20,
  southnode: 20,
  lilith: 20,
  ascendant: -14,
  midheaven: -14,
};

interface NatalChartWheelProps {
  chart: NatalChartResult;
  showAspects?: boolean;
  showHouses?: boolean;
  className?: string;
}

function buildPositionMap(
  chart: NatalChartResult,
  ascendantLongitude: number | null,
): Map<string, { x: number; y: number; angle: number }> {
  const positions = new Map<string, { x: number; y: number; angle: number }>();

  for (const planet of chart.planets) {
    const angle = longitudeToWheelAngle(planet.longitude, ascendantLongitude);
    const radius = R_PLANET + (PLANET_RADIUS_OFFSET[planet.name] ?? 0);
    positions.set(planet.name, {
      angle,
      ...polarToCartesian(WHEEL_CENTER, WHEEL_CENTER, radius, angle),
    });
  }

  for (const angle of chart.angles ?? []) {
    const wheelAngle = longitudeToWheelAngle(angle.longitude, ascendantLongitude);
    const radius = R_PLANET + (PLANET_RADIUS_OFFSET[angle.name] ?? 0);
    positions.set(angle.name, {
      angle: wheelAngle,
      ...polarToCartesian(WHEEL_CENTER, WHEEL_CENTER, radius, wheelAngle),
    });
  }

  return positions;
}

export function NatalChartWheel({
  chart,
  showAspects = true,
  showHouses,
  className = "",
}: NatalChartWheelProps) {
  const strings = t();
  const ascendantLongitude =
    chart.angles?.find((angle) => angle.name === "ascendant")?.longitude ?? null;
  const housesVisible = showHouses ?? chart.hasBirthTime;
  const positions = buildPositionMap(chart, ascendantLongitude);

  return (
    <svg
      viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
      role="img"
      aria-label={strings.chart.wheelLabel}
      className={["mx-auto w-full max-w-[min(100%,22rem)] text-foreground", className]
        .filter(Boolean)
        .join(" ")}
    >
      <circle
        cx={WHEEL_CENTER}
        cy={WHEEL_CENTER}
        r={R_OUTER}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.35}
        strokeWidth={1}
      />
      <circle
        cx={WHEEL_CENTER}
        cy={WHEEL_CENTER}
        r={R_INNER}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.35}
        strokeWidth={1}
      />

      {housesVisible &&
        chart.houses?.map((house) => {
          const angle = longitudeToWheelAngle(house.longitude, ascendantLongitude);
          const outer = polarToCartesian(
            WHEEL_CENTER,
            WHEEL_CENTER,
            R_OUTER,
            angle,
          );
          const inner = polarToCartesian(
            WHEEL_CENTER,
            WHEEL_CENTER,
            R_INNER,
            angle,
          );

          return (
            <line
              key={`house-${house.number}`}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="currentColor"
              strokeOpacity={0.2}
              strokeWidth={0.75}
            />
          );
        })}

      {ZODIAC_SIGNS.map((sign, index) => {
        const cuspLongitude = index * 30;
        const angle = longitudeToWheelAngle(cuspLongitude, ascendantLongitude);
        const outer = polarToCartesian(WHEEL_CENTER, WHEEL_CENTER, R_OUTER, angle);
        const inner = polarToCartesian(WHEEL_CENTER, WHEEL_CENTER, R_INNER, angle);

        return (
          <line
            key={`sign-cusp-${sign}`}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="currentColor"
            strokeOpacity={0.25}
            strokeWidth={0.75}
          />
        );
      })}

      {showAspects &&
        chart.aspects.map((aspect, index) => {
          const from = positions.get(aspect.body1);
          const to = positions.get(aspect.body2);

          if (!from || !to) {
            return null;
          }

          const fromInner = polarToCartesian(
            WHEEL_CENTER,
            WHEEL_CENTER,
            R_ASPECT,
            from.angle,
          );
          const toInner = polarToCartesian(
            WHEEL_CENTER,
            WHEEL_CENTER,
            R_ASPECT,
            to.angle,
          );

          return (
            <line
              key={`aspect-${aspect.body1}-${aspect.body2}-${aspect.type}-${index}`}
              x1={fromInner.x}
              y1={fromInner.y}
              x2={toInner.x}
              y2={toInner.y}
              stroke="#888888"
              strokeWidth={0.75}
              strokeOpacity={0.7}
            />
          );
        })}

      {ZODIAC_SIGNS.map((sign, index) => {
        const labelLongitude = index * 30 + 15;
        const angle = longitudeToWheelAngle(labelLongitude, ascendantLongitude);
        const { x, y } = polarToCartesian(
          WHEEL_CENTER,
          WHEEL_CENTER,
          (R_OUTER + R_INNER) / 2,
          angle,
        );
        const shortLabel =
          strings.astrology.signsShort[
            sign as keyof typeof strings.astrology.signsShort
          ];

        return (
          <text
            key={`sign-label-${sign}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="currentColor"
            fontSize={11}
            transform={`rotate(${angle + 90}, ${x}, ${y})`}
          >
            {shortLabel}
          </text>
        );
      })}

      {chart.planets.map((planet) => {
        const position = positions.get(planet.name);
        if (!position) {
          return null;
        }

        return (
          <g key={`planet-${planet.name}`}>
            <circle
              cx={position.x}
              cy={position.y}
              r={3}
              fill="currentColor"
              fillOpacity={0.9}
            />
            <text
              x={position.x}
              y={position.y - 10}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="currentColor"
              fontSize={14}
              fontFamily="serif"
            >
              {getBodySymbol(planet.name)}
              {planet.retrograde ? " ℞" : ""}
            </text>
          </g>
        );
      })}

      {chart.angles?.map((angle) => {
        const position = positions.get(angle.name);
        if (!position) {
          return null;
        }

        return (
          <g key={`angle-${angle.name}`}>
            <circle
              cx={position.x}
              cy={position.y}
              r={2.5}
              fill="currentColor"
              fillOpacity={0.75}
            />
            <text
              x={position.x}
              y={position.y - 10}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="currentColor"
              fontSize={10}
              letterSpacing="0.05em"
            >
              {getBodySymbol(angle.name)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
