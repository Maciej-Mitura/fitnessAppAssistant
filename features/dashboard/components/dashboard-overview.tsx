import { ClipboardList, Flame, Scale } from "lucide-react";

import { PlaceholderCard } from "@/components/placeholder-card";
import { StatCard } from "@/components/stat-card";
import { TodaySummary } from "@/features/dashboard/components/today-summary";
import { MacroDashboardSection } from "@/features/macros/components/macro-dashboard-section";
import type { DailyLog } from "@/types/daily-log";
import type { MacroTarget, MacroTotals } from "@/types/macros";

type DashboardOverviewProps = {
  activeTarget: MacroTarget | null;
  loggedMacros: MacroTotals | null;
  todayWeight: number | null;
  todayLogs: DailyLog[];
};

export function DashboardOverview({
  activeTarget,
  loggedMacros,
  todayWeight,
  todayLogs,
}: DashboardOverviewProps) {
  const caloriesToday = loggedMacros?.calories ?? null;

  return (
    <div className="space-y-6">
      <TodaySummary
        todayWeight={todayWeight}
        loggedMacros={loggedMacros}
        todayLogs={todayLogs}
      />

      <MacroDashboardSection activeTarget={activeTarget} logged={loggedMacros} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard
          label="Weight"
          value={todayWeight !== null ? `${todayWeight} kg` : "—"}
          hint="Logged today"
          icon={Scale}
        />
        <StatCard
          label="Calories"
          value={caloriesToday !== null ? caloriesToday.toLocaleString() : "—"}
          hint={
            activeTarget
              ? `of ${activeTarget.calories.toLocaleString()} target`
              : "Consumed today"
          }
          icon={Flame}
        />
        <StatCard
          label="Protein"
          value={loggedMacros?.protein_g ? `${loggedMacros.protein_g}g` : "—"}
          hint="Logged today"
          icon={Flame}
        />
        <StatCard
          label="Log entries"
          value={String(todayLogs.length)}
          hint="Today"
          icon={ClipboardList}
        />
      </div>

      <PlaceholderCard
        title="Recent activity"
        description="Workouts and check-ins will appear here."
        badge="Coming soon"
      >
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3"
            >
              <span className="size-2 rounded-full bg-primary/70" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2 w-2/3 rounded bg-muted-foreground/20" />
                <div className="h-2 w-1/3 rounded bg-muted-foreground/10" />
              </div>
            </div>
          ))}
        </div>
      </PlaceholderCard>
    </div>
  );
}
