import "server-only";

import { buildHeatmapData } from "@/features/heatmap/scoring";
import type { HeatmapData } from "@/features/heatmap/types";
import type { ProgressRange } from "@/features/progress/types";
import { getRangeStartDate } from "@/features/progress/utils";
import { requireUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

export async function getTrainingHeatmapData(
  range: ProgressRange
): Promise<HeatmapData> {
  const user = await requireUser();
  const supabase = await createClient();
  const start = getRangeStartDate(range);

  let workoutQuery = supabase
    .from("workout_logs")
    .select("id, date")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (start) {
    workoutQuery = workoutQuery.gte("date", start);
  }

  const { data: workouts, error: workoutError } = await workoutQuery;

  if (workoutError) {
    throw new Error(workoutError.message);
  }

  if (!workouts?.length) {
    return buildHeatmapData([], range);
  }

  const workoutIds = workouts.map((workout) => workout.id);
  const dateByWorkout = new Map(workouts.map((workout) => [workout.id, workout.date]));

  const { data: exercises, error: exerciseError } = await supabase
    .from("exercise_logs")
    .select("workout_log_id, exercise_name, sets")
    .eq("user_id", user.id)
    .in("workout_log_id", workoutIds);

  if (exerciseError) {
    throw new Error(exerciseError.message);
  }

  const rows = (exercises ?? [])
    .map((exercise) => {
      const date = dateByWorkout.get(exercise.workout_log_id);
      if (!date) {
        return null;
      }

      return {
        exercise_name: exercise.exercise_name,
        sets: exercise.sets,
        date,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  return buildHeatmapData(rows, range);
}
