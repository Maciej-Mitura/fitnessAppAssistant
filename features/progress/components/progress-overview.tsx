import { PlaceholderCard } from "@/components/placeholder-card";
import { DailyLogList } from "@/features/log/components/daily-log-list";
import type { DailyLogWithWeight } from "@/types/daily-log";

type ProgressOverviewProps = {
  recentLogs: DailyLogWithWeight[];
};

export function ProgressOverview({ recentLogs }: ProgressOverviewProps) {
  return (
    <div className="space-y-4">
      <DailyLogList logs={recentLogs} />

      <div className="grid gap-4 md:grid-cols-2">
        <PlaceholderCard
          title="Weight trend"
          description="Charts coming soon — use daily logs to build your history."
          badge="Chart soon"
        >
          <p className="text-sm text-muted-foreground">
            Keep logging bodyweight on the Log page to prepare for trend charts.
          </p>
        </PlaceholderCard>

        <PlaceholderCard
          title="Strength PRs"
          description="Personal records for your main lifts."
          badge="Coming soon"
        >
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Bench press — —</p>
            <p>Squat — —</p>
            <p>Deadlift — —</p>
          </div>
        </PlaceholderCard>
      </div>
    </div>
  );
}
