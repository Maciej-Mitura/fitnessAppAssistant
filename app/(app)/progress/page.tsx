import { PageHeader } from "@/components/layout/page-header";
import { getRecentDailyLogs } from "@/features/log/queries";
import { ProgressOverview } from "@/features/progress/components/progress-overview";

export default async function ProgressPage() {
  const recentLogs = await getRecentDailyLogs(14);

  return (
    <>
      <PageHeader
        title="Progress"
        description="Visualize trends, PRs, and consistency over time."
      />
      <ProgressOverview recentLogs={recentLogs} />
    </>
  );
}
