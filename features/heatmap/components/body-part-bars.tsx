import type { BodyPartScore } from "@/features/heatmap/types";
import { cn } from "@/lib/utils";

type BodyPartBarsProps = {
  scores: BodyPartScore[];
};

function barColor(intensity: number) {
  if (intensity >= 75) return "bg-primary";
  if (intensity >= 50) return "bg-primary/70";
  if (intensity >= 25) return "bg-primary/45";
  if (intensity > 0) return "bg-primary/25";
  return "bg-muted";
}

export function BodyPartBars({ scores }: BodyPartBarsProps) {
  return (
    <div className="space-y-3">
      {scores.map((item) => (
        <div key={item.part} className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium">{item.label}</span>
            <span className="tabular-nums text-muted-foreground">
              {item.score} pts · {item.weeklyVolume}/wk
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted/60">
            <div
              className={cn("h-full rounded-full transition-all", barColor(item.intensity))}
              style={{ width: `${Math.max(item.intensity, item.score > 0 ? 4 : 0)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
