import { PageHeader } from "@/components/layout/page-header";
import { PlansDashboard } from "@/features/plans/components/plans-dashboard";
import { getPlansWithWorkouts } from "@/features/plans/queries";

export default async function PlansPage() {
  const plans = await getPlansWithWorkouts();

  return (
    <>
      <PageHeader
        title="Plans"
        description="Build training blocks, set your active plan, and log workouts."
      />
      <PlansDashboard plans={plans} />
    </>
  );
}
