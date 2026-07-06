import "server-only";

import { getDaysAgoISO } from "@/lib/date";
import { requireUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { getActiveMacroTarget } from "@/features/macros/queries";
import { getProfile } from "@/features/profile/queries";
import type { CoachContext, CoachWorkout } from "@/types/coach";

const LOOKBACK_DAYS = 14;

export async function getCoachContext(): Promise<CoachContext> {
  const user = await requireUser();
  const supabase = await createClient();
  const startDate = getDaysAgoISO(LOOKBACK_DAYS);

  const [
    profile,
    macroTarget,
    { data: dailyLogs, error: dailyError },
    { data: bodyMetrics, error: bodyError },
    { data: workouts, error: workoutError },
    { data: specialEvents, error: eventsError },
  ] = await Promise.all([
    getProfile(),
    getActiveMacroTarget(),
    supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("body_metrics")
      .select("date, weight_kg")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .not("weight_kg", "is", null)
      .order("date", { ascending: false }),
    supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("special_events")
      .select("date, type, description")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .order("date", { ascending: false }),
  ]);

  if (dailyError) throw new Error(dailyError.message);
  if (bodyError) throw new Error(bodyError.message);
  if (workoutError) throw new Error(workoutError.message);
  if (eventsError) throw new Error(eventsError.message);

  const workoutList = workouts ?? [];
  const workoutIds = workoutList.map((workout) => workout.id);

  const exercisesByWorkout = new Map<string, CoachWorkout["exercises"]>();

  if (workoutIds.length > 0) {
    const { data: exercises, error: exerciseError } = await supabase
      .from("exercise_logs")
      .select("workout_log_id, exercise_name, sets, reps, weight_kg, notes")
      .eq("user_id", user.id)
      .in("workout_log_id", workoutIds);

    if (exerciseError) {
      throw new Error(exerciseError.message);
    }

    for (const exercise of exercises ?? []) {
      const list = exercisesByWorkout.get(exercise.workout_log_id) ?? [];
      list.push({
        exercise_name: exercise.exercise_name,
        sets: exercise.sets,
        reps: exercise.reps,
        weight_kg: exercise.weight_kg ? Number(exercise.weight_kg) : null,
        notes: exercise.notes,
      });
      exercisesByWorkout.set(exercise.workout_log_id, list);
    }
  }

  const workoutsWithExercises: CoachWorkout[] = workoutList.map((workout) => ({
    id: workout.id,
    date: workout.date,
    workout_type: workout.workout_type,
    raw_text: workout.raw_text,
    ai_summary: workout.ai_summary,
    pain_notes: workout.pain_notes,
    fatigue_score: workout.fatigue_score,
    exercises: exercisesByWorkout.get(workout.id) ?? [],
  }));

  return {
    profile,
    macroTarget,
    dailyLogs: dailyLogs ?? [],
    bodyMetrics: (bodyMetrics ?? []).map((row) => ({
      date: row.date,
      weight_kg: Number(row.weight_kg),
    })),
    workouts: workoutsWithExercises,
    specialEvents: specialEvents ?? [],
  };
}
