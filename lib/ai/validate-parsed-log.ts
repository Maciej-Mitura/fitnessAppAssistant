import type { ParsedExercise, ParsedLog } from "@/types/parsed-log";

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function validateExercise(value: unknown): ParsedExercise | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const exercise = value as Record<string, unknown>;

  if (typeof exercise.name !== "string" || exercise.name.trim() === "") {
    return null;
  }

  if (!isNullableNumber(exercise.weight_kg)) {
    return null;
  }

  if (
    exercise.sets !== null &&
    (typeof exercise.sets !== "number" ||
      !Number.isInteger(exercise.sets) ||
      exercise.sets < 0)
  ) {
    return null;
  }

  if (!isNullableString(exercise.reps)) {
    return null;
  }

  if (!isNullableString(exercise.notes)) {
    return null;
  }

  return {
    name: exercise.name.trim(),
    weight_kg: exercise.weight_kg,
    sets: exercise.sets as number | null,
    reps: exercise.reps,
    notes: exercise.notes,
  };
}

export function validateParsedLog(value: unknown): ParsedLog | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const data = value as Record<string, unknown>;

  if (
    !isNullableNumber(data.bodyweight_kg) ||
    !isNullableNumber(data.calories) ||
    !isNullableNumber(data.protein_g) ||
    !isNullableNumber(data.carbs_g) ||
    !isNullableNumber(data.fat_g) ||
    typeof data.workout_detected !== "boolean" ||
    !isNullableString(data.workout_type) ||
    !Array.isArray(data.exercises) ||
    !isNullableString(data.pain_notes) ||
    !isNullableString(data.fatigue_notes) ||
    !isStringArray(data.special_events) ||
    typeof data.summary !== "string" ||
    typeof data.feedback !== "string"
  ) {
    return null;
  }

  const exercises: ParsedExercise[] = [];

  for (const item of data.exercises) {
    const exercise = validateExercise(item);
    if (!exercise) {
      return null;
    }
    exercises.push(exercise);
  }

  return {
    bodyweight_kg: data.bodyweight_kg,
    calories: data.calories,
    protein_g: data.protein_g,
    carbs_g: data.carbs_g,
    fat_g: data.fat_g,
    workout_detected: data.workout_detected,
    workout_type: data.workout_type,
    exercises,
    pain_notes: data.pain_notes,
    fatigue_notes: data.fatigue_notes,
    special_events: data.special_events,
    summary: data.summary.trim(),
    feedback: data.feedback.trim(),
  };
}
