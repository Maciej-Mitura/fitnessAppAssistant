import { DashboardInsightCards } from "@/features/dashboard/components/insight-cards";
import { DashboardMacroCard } from "@/features/dashboard/components/macro-card";
import { DashboardQuickActions } from "@/features/dashboard/components/quick-actions";
import type { DashboardData } from "@/features/dashboard/queries";

export function DashboardOverview({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <DashboardQuickActions />

      <DashboardMacroCard
        activeTarget={data.activeTarget}
        loggedMacros={data.loggedMacros}
        hasLogToday={data.hasLogToday}
      />

      <DashboardInsightCards
        latestWeight={data.latestWeight}
        latestFeedback={data.latestFeedback}
        latestWorkout={data.latestWorkout}
      />
    </div>
  );
}
