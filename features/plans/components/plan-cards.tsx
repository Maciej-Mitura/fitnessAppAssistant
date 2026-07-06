"use client";

import { useState, useTransition } from "react";
import { Pencil, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deletePlan, setActivePlan } from "@/features/plans/actions";
import type { TrainingPlanWithWorkouts } from "@/types/plans";

type PlanCardsProps = {
  plans: TrainingPlanWithWorkouts[];
  onEditPlan: (plan: TrainingPlanWithWorkouts) => void;
};

export function PlanCards({ plans, onEditPlan }: PlanCardsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  function handleSetActive(planId: string) {
    setPendingPlanId(planId);

    startTransition(async () => {
      const result = await setActivePlan(planId);

      if (!result.success) {
        toast.error(result.error ?? "Failed to set active plan.");
        setPendingPlanId(null);
        return;
      }

      toast.success("Active plan updated.");
      setPendingPlanId(null);
      router.refresh();
    });
  }

  function handleDelete(planId: string, planName: string) {
    if (!window.confirm(`Delete "${planName}"? This cannot be undone.`)) {
      return;
    }

    setPendingPlanId(planId);

    startTransition(async () => {
      const result = await deletePlan(planId);

      if (!result.success) {
        toast.error(result.error ?? "Failed to delete plan.");
        setPendingPlanId(null);
        return;
      }

      toast.success("Plan deleted.");
      setPendingPlanId(null);
      router.refresh();
    });
  }

  if (plans.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>No training plans yet</CardTitle>
          <CardDescription>
            Create your first plan to organize workouts and exercises.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => {
        const isBusy = isPending && pendingPlanId === plan.id;
        const exerciseCount = plan.workouts.reduce(
          (total, workout) => total + workout.exercises.length,
          0
        );

        return (
          <Card key={plan.id} className={plan.is_active ? "border-primary/40" : undefined}>
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{plan.name}</CardTitle>
                {plan.is_active ? (
                  <Badge className="shrink-0 text-[10px] uppercase tracking-wide">
                    Active
                  </Badge>
                ) : null}
              </div>
              <CardDescription className="line-clamp-2">
                {plan.goal ?? "No goal set."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">
                {plan.workouts.length} workouts · {exerciseCount} exercises
              </p>
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2">
              {!plan.is_active ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSetActive(plan.id)}
                  disabled={isBusy}
                >
                  <Star className="size-3.5" />
                  Set active
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditPlan(plan)}
                disabled={isBusy}
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(plan.id, plan.name)}
                disabled={isBusy}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
