import type { PlannedExercise, PlannedWorkout } from "@/types/plans";

export function formatExerciseRow(exercise: PlannedExercise) {
  const parts = [
    exercise.sets ? `${exercise.sets} sets` : null,
    exercise.reps ? `${exercise.reps} reps` : null,
    exercise.weight_kg ? `${exercise.weight_kg} kg` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "No set prescription";
}

export function buildWorkoutTemplate(workout: PlannedWorkout) {
  if (workout.exercises.length === 0) {
    return `${workout.name}\n`;
  }

  const lines = workout.exercises.map((exercise) => {
    const details = [
      exercise.sets ? `${exercise.sets}x` : null,
      exercise.reps ?? null,
      exercise.weight_kg ? `@ ${exercise.weight_kg}kg` : null,
    ]
      .filter(Boolean)
      .join("");

    return `- ${exercise.exercise_name}${details ? ` ${details}` : ""}`;
  });

  return `${workout.name}\n${lines.join("\n")}\n`;
}
