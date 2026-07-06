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
import { updatePlannedExercise } from "@/features/plans/actions";
import type { PlannedExercise } from "@/types/plans";

type EditExerciseDialogProps = {
  exercise: PlannedExercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ExerciseFormState = {
  exerciseName: string;
  sets: string;
  reps: string;
  weightKg: string;
  notes: string;
};

function toFormState(exercise: PlannedExercise): ExerciseFormState {
  return {
    exerciseName: exercise.exercise_name,
    sets: exercise.sets?.toString() ?? "",
    reps: exercise.reps ?? "",
    weightKg: exercise.weight_kg?.toString() ?? "",
    notes: exercise.notes ?? "",
  };
}

export function EditExerciseDialog({
  exercise,
  open,
  onOpenChange,
}: EditExerciseDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<ExerciseFormState>({
    exerciseName: "",
    sets: "",
    reps: "",
    weightKg: "",
    notes: "",
  });

  useEffect(() => {
    if (exercise) {
      setForm(toFormState(exercise));
    }
  }, [exercise]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!exercise) return;

    startTransition(async () => {
      const result = await updatePlannedExercise({
        exerciseId: exercise.id,
        exerciseName: form.exerciseName,
        sets: form.sets,
        reps: form.reps,
        weightKg: form.weightKg,
        notes: form.notes,
      });

      if (!result.success) {
        toast.error(result.error ?? "Failed to update exercise.");
        return;
      }

      toast.success("Exercise updated.");
      onOpenChange(false);
      router.refresh();
    });
  }

  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit exercise</DialogTitle>
          <DialogDescription>Update the planned prescription.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-exercise-name">Exercise</Label>
            <Input
              id="edit-exercise-name"
              value={form.exerciseName}
              onChange={(event) =>
                setForm((current) => ({ ...current, exerciseName: event.target.value }))
              }
              required
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-sets">Sets</Label>
              <Input
                id="edit-sets"
                type="number"
                min={1}
                value={form.sets}
                onChange={(event) =>
                  setForm((current) => ({ ...current, sets: event.target.value }))
                }
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-reps">Reps</Label>
              <Input
                id="edit-reps"
                value={form.reps}
                onChange={(event) =>
                  setForm((current) => ({ ...current, reps: event.target.value }))
                }
                placeholder="5,5,4"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-weight">kg</Label>
              <Input
                id="edit-weight"
                type="number"
                step="0.5"
                value={form.weightKg}
                onChange={(event) =>
                  setForm((current) => ({ ...current, weightKg: event.target.value }))
                }
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
              rows={2}
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save exercise"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
