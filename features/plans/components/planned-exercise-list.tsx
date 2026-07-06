"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { deletePlannedExercise } from "@/features/plans/actions";
import { formatExerciseRow } from "@/features/plans/utils";
import type { PlannedExercise } from "@/types/plans";
import { EditExerciseDialog } from "@/features/plans/components/edit-exercise-dialog";

type PlannedExerciseListProps = {
  exercises: PlannedExercise[];
};

export function PlannedExerciseList({ exercises }: PlannedExerciseListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingExercise, setEditingExercise] = useState<PlannedExercise | null>(null);

  function handleDelete(exerciseId: string) {
    startTransition(async () => {
      const result = await deletePlannedExercise(exerciseId);

      if (!result.success) {
        toast.error(result.error ?? "Failed to delete exercise.");
        return;
      }

      toast.success("Exercise removed.");
      router.refresh();
    });
  }

  if (exercises.length === 0) {
    return (
      <p className="py-2 text-sm text-muted-foreground">
        No exercises yet. Add exercises to this workout.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium capitalize">{exercise.exercise_name}</p>
              <p className="text-sm text-muted-foreground">
                {formatExerciseRow(exercise)}
              </p>
              {exercise.notes ? (
                <p className="mt-1 text-xs text-muted-foreground">{exercise.notes}</p>
              ) : null}
            </div>

            <div className="flex shrink-0 gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setEditingExercise(exercise)}
                disabled={isPending}
                aria-label="Edit exercise"
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => handleDelete(exercise.id)}
                disabled={isPending}
                aria-label="Delete exercise"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <EditExerciseDialog
        exercise={editingExercise}
        open={Boolean(editingExercise)}
        onOpenChange={(open) => {
          if (!open) setEditingExercise(null);
        }}
      />
    </>
  );
}
