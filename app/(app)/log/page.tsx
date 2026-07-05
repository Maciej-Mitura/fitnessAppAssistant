import { PageHeader } from "@/components/layout/page-header";
import { DailyLogForm } from "@/features/log/components/daily-log-form";
import { DailyLogList } from "@/features/log/components/daily-log-list";
import { getRecentDailyLogs } from "@/features/log/queries";

export default async function LogPage() {
  const recentLogs = await getRecentDailyLogs(5);

  return (
    <>
      <PageHeader
        title="Log"
        description="Capture workouts, meals, and daily habits in one place."
      />
      <div className="space-y-6">
        <DailyLogForm />
        <DailyLogList
          logs={recentLogs}
          title="Recent entries"
          description="Your latest saved daily logs."
          emptyMessage="No entries yet. Use the form above to log your first day."
        />
      </div>
    </>
  );
}
