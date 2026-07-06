import { PageHeader } from "@/components/layout/page-header";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { getDashboardData } from "@/features/dashboard/queries";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A quick snapshot of your training, nutrition, and recovery."
      />
      <DashboardOverview data={data} />
    </>
  );
}
