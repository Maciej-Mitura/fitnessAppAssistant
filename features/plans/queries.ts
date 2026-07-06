import "server-only";

import { requireUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import type { TrainingPlanWithWorkouts } from "@/types/plans";

export async function getPlansWithWorkouts(): Promise<TrainingPlanWithWorkouts[]> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: plans, error: plansError } = await supabase
    .from("training_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false });

  if (plansError) {
    throw new Error(plansError.message);
  }

  if (!plans?.length) {
    return [];
  }

  const planIds = plans.map((plan) => plan.id);

  const { data: workouts, error: workoutsError } = await supabase
    .from("planned_workouts")
    .select("*")
    .eq("user_id", user.id)
    .in("plan_id", planIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (workoutsError) {
    throw new Error(workoutsError.message);
  }

  const workoutIds = (workouts ?? []).map((workout) => workout.id);
  const exercisesByWorkout = new Map<string, TrainingPlanWithWorkouts["workouts"][0]["exercises"]>();

  if (workoutIds.length > 0) {
    const { data: exercises, error: exercisesError } = await supabase
      .from("planned_exercises")
      .select("*")
      .eq("user_id", user.id)
      .in("planned_workout_id", workoutIds)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (exercisesError) {
      throw new Error(exercisesError.message);
    }

    for (const exercise of exercises ?? []) {
      const list = exercisesByWorkout.get(exercise.planned_workout_id) ?? [];
      list.push({
        ...exercise,
        weight_kg: exercise.weight_kg ? Number(exercise.weight_kg) : null,
      });
      exercisesByWorkout.set(exercise.planned_workout_id, list);
    }
  }

  const workoutsByPlan = new Map<string, TrainingPlanWithWorkouts["workouts"]>();

  for (const workout of workouts ?? []) {
    const list = workoutsByPlan.get(workout.plan_id) ?? [];
    list.push({
      ...workout,
      exercises: exercisesByWorkout.get(workout.id) ?? [],
    });
    workoutsByPlan.set(workout.plan_id, list);
  }

  return plans.map((plan) => ({
    ...plan,
    workouts: workoutsByPlan.get(plan.id) ?? [],
  }));
}
