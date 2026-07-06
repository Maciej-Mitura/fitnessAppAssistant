import { Suspense } from "react";

import { TrainingHeatmap } from "@/features/heatmap/components/training-heatmap";
import type { HeatmapData } from "@/features/heatmap/types";
import { ProgressPhotosSection } from "@/features/progress-photos/components/progress-photos-section";
import { ProgressCharts } from "@/features/progress/components/progress-charts";
import { ProgressRangeSelector } from "@/features/progress/components/range-selector";
import type { ProgressChartData } from "@/features/progress/queries";
import type { ProgressRange } from "@/features/progress/types";
import type { ProgressPhotoWithUrl } from "@/types/progress-photos";

type ProgressDashboardProps = {
  data: ProgressChartData;
  range: ProgressRange;
  photos: ProgressPhotoWithUrl[];
  heatmap: HeatmapData;
};

export function ProgressDashboard({
  data,
  range,
  photos,
  heatmap,
}: ProgressDashboardProps) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="h-8" />}>
        <ProgressRangeSelector currentRange={range} />
      </Suspense>
      <ProgressCharts data={data} range={range} />
      <TrainingHeatmap data={heatmap} range={range} />
      <ProgressPhotosSection photos={photos} />
    </div>
  );
}
