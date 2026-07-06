"use client";

import { useState, useTransition } from "react";
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
import { createPlan } from "@/features/plans/actions";

type CreatePlanDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreatePlanDialog({ open, onOpenChange }: CreatePlanDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [setActive, setSetActive] = useState(true);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const result = await createPlan({ name, goal, setActive });

      if (!result.success) {
        toast.error(result.error ?? "Failed to create plan.");
        return;
      }

      toast.success("Training plan created.");
      setName("");
      setGoal("");
      setSetActive(true);
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create training plan</DialogTitle>
          <DialogDescription>
            Build a structured block with planned workouts and exercises.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plan-name">Plan name</Label>
            <Input
              id="plan-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Push / Pull / Legs"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-goal">Goal</Label>
            <Textarea
              id="plan-goal"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              placeholder="Build strength over 8 weeks"
              rows={3}
              disabled={isPending}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={setActive}
              onChange={(event) => setSetActive(event.target.checked)}
              disabled={isPending}
              className="size-4 rounded border-input"
            />
            Set as active plan
          </label>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating…" : "Create plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
