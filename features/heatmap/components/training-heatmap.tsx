"use client";

import { useState } from "react";
import { Info } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BodyDiagram } from "@/features/heatmap/components/body-diagram";
import { BodyPartBars } from "@/features/heatmap/components/body-part-bars";
import type { HeatmapData } from "@/features/heatmap/types";
import { getRangeLabel, type ProgressRange } from "@/features/progress/types";

type TrainingHeatmapProps = {
  data: HeatmapData;
  range: ProgressRange;
};

export function TrainingHeatmap({ data, range }: TrainingHeatmapProps) {
  const [showDetails, setShowDetails] = useState(false);
  const rangeLabel = getRangeLabel(range).toLowerCase();
  const hasData = data.totalMappedSets > 0;

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle>Training heatmap</CardTitle>
        <CardDescription>
          Body-part volume from logged exercises over the last {rangeLabel}. Scores use
          weighted set counts from keyword rules — no AI.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {!hasData ? (
          <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
            No mapped exercises in this period. Log workouts with exercise names like
            &quot;bench press&quot;, &quot;squat&quot;, or &quot;MMA&quot; on the Log page.
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
              <BodyPartBars scores={data.bodyPartScores} />
              <BodyDiagram scores={data.bodyPartScores} />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Mapped sets" value={String(data.totalMappedSets)} />
              <Stat
                label="Weekly avg"
                value={`${Math.round((data.totalMappedSets / data.weeksInRange) * 10) / 10}`}
              />
              <Stat label="Weeks" value={String(data.weeksInRange)} />
              <Stat label="Unmapped" value={String(data.unmappedExercises)} />
            </div>

            <button
              type="button"
              onClick={() => setShowDetails((open) => !open)}
              className="inline-flex cursor-pointer items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Info className="size-3.5" />
              {showDetails ? "Hide" : "Show"} mapping details
            </button>

            {showDetails ? (
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
                {data.mappedContributions.slice(0, 30).map((item, index) => (
                  <div
                    key={`${item.exerciseName}-${item.date}-${index}`}
                    className="flex flex-col gap-0.5 border-b border-border/40 pb-2 last:border-0 last:pb-0"
                  >
                    <p className="font-medium">
                      {item.exerciseName}{" "}
                      <span className="font-normal text-muted-foreground">
                        · {item.setVolume} sets · {item.date}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      {item.parts
                        .map((part) => `${part.part}×${part.weight}`)
                        .join(", ")}{" "}
                      — {item.reason}
                    </p>
                  </div>
                ))}
                {data.mappedContributions.length > 30 ? (
                  <p className="pt-1 text-muted-foreground">
                    +{data.mappedContributions.length - 30} more entries
                  </p>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
