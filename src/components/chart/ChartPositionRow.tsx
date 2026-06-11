import { formatSignDegree } from "@/lib/chart/format";
import type { ZodiacSign } from "@/lib/astrology";

interface ChartPositionRowProps {
  label: string;
  sign: ZodiacSign | string;
  degreeInSign: number;
  highlighted?: boolean;
  meta?: string;
}

export function ChartPositionRow({
  label,
  sign,
  degreeInSign,
  highlighted = false,
  meta,
}: ChartPositionRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <span className={highlighted ? "font-medium" : "text-muted"}>{label}</span>
      <div className="text-right">
        <span className={highlighted ? "font-medium" : ""}>
          {formatSignDegree(sign, degreeInSign)}
        </span>
        {meta && <p className="mt-0.5 text-xs text-muted">{meta}</p>}
      </div>
    </div>
  );
}
