"use client";

import { useState, useTransition } from "react";
import { Play, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createPlannedExercise,
  deletePlannedWorkout,
} from "@/features/plans/actions";
import { PlannedExerciseList } from "@/features/plans/components/planned-exercise-list";
import { StartWorkoutDialog } from "@/features/plans/components/start-workout-dialog";
import { buildWorkoutTemplate } from "@/features/plans/utils";
import type { PlannedWorkout } from "@/types/plans";

type PlannedWorkoutCardProps = {
  workout: PlannedWorkout;
};

export function PlannedWorkoutCard({ workout }: PlannedWorkoutCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [startWorkoutOpen, setStartWorkoutOpen] = useState(false);

  function handleDeleteWorkout() {
    startTransition(async () => {
      const result = await deletePlannedWorkout(workout.id);

      if (!result.success) {
        toast.error(result.error ?? "Failed to delete workout.");
        return;
      }

      toast.success("Workout removed.");
      router.refresh();
    });
  }

  function handleAddExercise(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createPlannedExercise({
        workoutId: workout.id,
        exerciseName: String(formData.get("exercise_name") ?? ""),
        sets: String(formData.get("sets") ?? ""),
        reps: String(formData.get("reps") ?? ""),
        weightKg: String(formData.get("weight_kg") ?? ""),
        notes: String(formData.get("notes") ?? ""),
      });

      if (!result.success) {
        toast.error(result.error ?? "Failed to add exercise.");
        return;
      }

      toast.success("Exercise added.");
      event.currentTarget.reset();
      setShowAddExercise(false);
      router.refresh();
    });
  }

  return (
    <>
      <AccordionItem value={workout.id} className="rounded-lg border border-border/60 px-3">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex flex-1 items-center gap-2 pr-2">
            <span className="font-medium">{workout.name}</span>
            <Badge variant="secondary" className="text-[10px]">
              {workout.exercises.length} exercises
            </Badge>
          </div>
        </AccordionTrigger>

        <AccordionContent className="space-y-4 pb-4">
          {workout.notes ? (
            <p className="text-sm text-muted-foreground">{workout.notes}</p>
          ) : null}

          <PlannedExerciseList exercises={workout.exercises} />

          {showAddExercise ? (
            <form onSubmit={handleAddExercise} className="space-y-3 rounded-lg border border-dashed border-border/80 p-3">
              <div className="space-y-2">
                <Label htmlFor={`exercise-${workout.id}`}>Exercise name</Label>
                <Input
                  id={`exercise-${workout.id}`}
                  name="exercise_name"
                  placeholder="Bench press"
                  required
                  disabled={isPending}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor={`sets-${workout.id}`}>Sets</Label>
                  <Input
                    id={`sets-${workout.id}`}
                    name="sets"
                    type="number"
                    min={1}
                    placeholder="3"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`reps-${workout.id}`}>Reps</Label>
                  <Input
                    id={`reps-${workout.id}`}
                    name="reps"
                    placeholder="5,5,4"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`weight-${workout.id}`}>kg</Label>
                  <Input
                    id={`weight-${workout.id}`}
                    name="weight_kg"
                    type="number"
                    step="0.5"
                    placeholder="80"
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? "Adding…" : "Add exercise"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddExercise(false)}
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
              onClick={() => setShowAddExercise(true)}
              disabled={isPending}
            >
              <Plus className="size-3.5" />
              Add exercise
            </Button>
          )}

          <div className="flex flex-wrap gap-2 border-t border-border/50 pt-3">
            <Button
              type="button"
              size="sm"
              onClick={() => setStartWorkoutOpen(true)}
              disabled={isPending}
            >
              <Play className="size-3.5" />
              Start workout
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDeleteWorkout}
              disabled={isPending}
            >
              <Trash2 className="size-3.5" />
              Remove workout
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>

      <StartWorkoutDialog
        open={startWorkoutOpen}
        onOpenChange={setStartWorkoutOpen}
        workoutName={workout.name}
        templateText={buildWorkoutTemplate(workout)}
      />
    </>
  );
}
