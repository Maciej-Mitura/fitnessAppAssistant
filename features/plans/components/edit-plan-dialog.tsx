"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updatePlan } from "@/features/plans/actions";
import type { TrainingPlanWithWorkouts } from "@/types/plans";

type EditPlanDialogProps = {
  plan: TrainingPlanWithWorkouts | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditPlanDialog({ plan, open, onOpenChange }: EditPlanDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setGoal(plan.goal ?? "");
    }
  }, [plan]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!plan) return;

    startTransition(async () => {
      const result = await updatePlan({
        planId: plan.id,
        name,
        goal,
      });

      if (!result.success) {
        toast.error(result.error ?? "Failed to update plan.");
        return;
      }

      toast.success("Plan updated.");
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit plan</DialogTitle>
          <DialogDescription>Update the plan name and goal.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-plan-name">Plan name</Label>
            <Input
              id="edit-plan-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-plan-goal">Goal</Label>
            <Textarea
              id="edit-plan-goal"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              rows={3}
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending || !plan}>
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
