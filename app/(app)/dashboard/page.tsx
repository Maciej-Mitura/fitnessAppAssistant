import { PageHeader } from "@/components/layout/page-header";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import {
  getTodayBodyWeight,
  getTodayDailyLogs,
} from "@/features/log/queries";
import {
  getActiveMacroTarget,
  getTodayLoggedMacros,
} from "@/features/macros/queries";

export default async function DashboardPage() {
  const [activeTarget, loggedMacros, todayWeight, todayLogs] = await Promise.all([
    getActiveMacroTarget(),
    getTodayLoggedMacros(),
    getTodayBodyWeight(),
    getTodayDailyLogs(),
  ]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A quick snapshot of your training, nutrition, and recovery."
      />
      <DashboardOverview
        activeTarget={activeTarget}
        loggedMacros={loggedMacros}
        todayWeight={todayWeight}
        todayLogs={todayLogs}
      />
    </>
  );
}
