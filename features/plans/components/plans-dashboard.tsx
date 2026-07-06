"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActivePlanView } from "@/features/plans/components/active-plan-view";
import { CreatePlanDialog } from "@/features/plans/components/create-plan-dialog";
import { EditPlanDialog } from "@/features/plans/components/edit-plan-dialog";
import { PlanCards } from "@/features/plans/components/plan-cards";
import type { TrainingPlanWithWorkouts } from "@/types/plans";

type PlansDashboardProps = {
  plans: TrainingPlanWithWorkouts[];
};

export function PlansDashboard({ plans }: PlansDashboardProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<TrainingPlanWithWorkouts | null>(null);

  const activePlan = plans.find((plan) => plan.is_active) ?? null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Training plans</h2>
          <p className="text-sm text-muted-foreground">
            Build workouts, set one active plan, and log sessions from your schedule.
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          New plan
        </Button>
      </div>

      {activePlan ? (
        <section className="space-y-3">
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Active plan
          </h3>
          <ActivePlanView plan={activePlan} />
        </section>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          All plans
        </h3>
        <PlanCards plans={plans} onEditPlan={setEditPlan} />
      </section>

      <CreatePlanDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditPlanDialog
        plan={editPlan}
        open={Boolean(editPlan)}
        onOpenChange={(open) => {
          if (!open) setEditPlan(null);
        }}
      />
    </div>
  );
}
