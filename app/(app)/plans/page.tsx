import { PageHeader } from "@/components/layout/page-header";
import { PlansList } from "@/features/plans/components/plans-list";

export default function PlansPage() {
  return (
    <>
      <PageHeader
        title="Plans"
        description="Manage training blocks, nutrition templates, and habits."
      />
      <PlansList />
    </>
  );
}
