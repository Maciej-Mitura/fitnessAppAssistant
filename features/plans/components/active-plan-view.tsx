"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createPlannedWorkout } from "@/features/plans/actions";
import { PlannedWorkoutCard } from "@/features/plans/components/planned-workout-card";
import type { TrainingPlanWithWorkouts } from "@/types/plans";

type ActivePlanViewProps = {
  plan: TrainingPlanWithWorkouts;
};

export function ActivePlanView({ plan }: ActivePlanViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutNotes, setWorkoutNotes] = useState("");

  function handleAddWorkout(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const result = await createPlannedWorkout({
        planId: plan.id,
        name: workoutName,
        notes: workoutNotes,
      });

      if (!result.success) {
        toast.error(result.error ?? "Failed to add workout.");
        return;
      }

      toast.success("Workout added.");
      setWorkoutName("");
      setWorkoutNotes("");
      setShowAddWorkout(false);
      router.refresh();
    });
  }

  return (
    <Card className="border-primary/30 bg-card/90">
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>
          {plan.goal ?? "No goal set."} · {plan.workouts.length} planned workouts
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {plan.workouts.length > 0 ? (
          <Accordion defaultValue={[plan.workouts[0]?.id]} className="space-y-2">
            {plan.workouts.map((workout) => (
              <PlannedWorkoutCard key={workout.id} workout={workout} />
            ))}
          </Accordion>
        ) : (
          <p className="text-sm text-muted-foreground">
            No workouts yet. Add your first planned session below.
          </p>
        )}

        {showAddWorkout ? (
          <form
            onSubmit={handleAddWorkout}
            className="space-y-3 rounded-lg border border-dashed border-border/80 p-4"
          >
            <div className="space-y-2">
              <Label htmlFor="workout-name">Workout name</Label>
              <Input
                id="workout-name"
                value={workoutName}
                onChange={(event) => setWorkoutName(event.target.value)}
                placeholder="Push day"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workout-notes">Notes</Label>
              <Textarea
                id="workout-notes"
                value={workoutNotes}
                onChange={(event) => setWorkoutNotes(event.target.value)}
                placeholder="Focus on chest and shoulders"
                rows={2}
                disabled={isPending}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? "Adding…" : "Add workout"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddWorkout(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddWorkout(true)}
            disabled={isPending}
          >
            <Plus className="size-3.5" />
            Add workout
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
