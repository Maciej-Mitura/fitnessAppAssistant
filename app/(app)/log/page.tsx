import { PageHeader } from "@/components/layout/page-header";
import { AiLogParser } from "@/features/log/components/ai-log-parser";
import { DailyLogForm } from "@/features/log/components/daily-log-form";
import { DailyLogList } from "@/features/log/components/daily-log-list";
import { getRecentDailyLogs } from "@/features/log/queries";
import { Separator } from "@/components/ui/separator";

export default async function LogPage() {
  const recentLogs = await getRecentDailyLogs(5);

  return (
    <>
      <PageHeader
        title="Log"
        description="Capture workouts, meals, and daily habits in one place."
      />
      <div className="space-y-6">
        <AiLogParser />

        <div className="flex items-center gap-4">
          <Separator className="flex-1 opacity-50" />
          <span className="text-xs text-muted-foreground">or enter manually</span>
          <Separator className="flex-1 opacity-50" />
        </div>

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
