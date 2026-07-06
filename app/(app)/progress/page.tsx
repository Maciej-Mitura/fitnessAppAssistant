import { PageHeader } from "@/components/layout/page-header";
import { getTrainingHeatmapData } from "@/features/heatmap/queries";
import { getProgressPhotosWithSignedUrls } from "@/features/progress-photos/queries";
import { ProgressDashboard } from "@/features/progress/components/progress-dashboard";
import { getProgressData } from "@/features/progress/queries";
import { parseProgressRange } from "@/features/progress/types";

type ProgressPageProps = {
  searchParams: Promise<{ range?: string }>;
};

export default async function ProgressPage({ searchParams }: ProgressPageProps) {
  const params = await searchParams;
  const range = parseProgressRange(params.range);
  const [data, photos, heatmap] = await Promise.all([
    getProgressData(range),
    getProgressPhotosWithSignedUrls(),
    getTrainingHeatmapData(range),
  ]);

  return (
    <>
      <PageHeader
        title="Progress"
        description="Visualize trends, PRs, and consistency over time."
      />
      <ProgressDashboard data={data} range={range} photos={photos} heatmap={heatmap} />
    </>
  );
}
