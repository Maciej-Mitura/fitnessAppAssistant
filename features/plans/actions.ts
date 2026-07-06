"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = {
  success: boolean;
  error: string | null;
};

function revalidatePlans() {
  revalidatePath("/plans");
}

async function deactivateAllPlans(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  return supabase
    .from("training_plans")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("is_active", true);
}

export async function createPlan(input: {
  name: string;
  goal?: string;
  setActive?: boolean;
}): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();
  const name = input.name.trim();

  if (!name) {
    return { success: false, error: "Plan name is required." };
  }

  if (input.setActive) {
    const { error: deactivateError } = await deactivateAllPlans(supabase, user.id);
    if (deactivateError) {
      return { success: false, error: deactivateError.message };
    }
  }

  const { error } = await supabase.from("training_plans").insert({
    user_id: user.id,
    name,
    goal: input.goal?.trim() || null,
    is_active: Boolean(input.setActive),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePlans();
  return { success: true, error: null };
}

export async function updatePlan(input: {
  planId: string;
  name: string;
  goal?: string;
}): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();
  const name = input.name.trim();

  if (!name) {
    return { success: false, error: "Plan name is required." };
  }

  const { error } = await supabase
    .from("training_plans")
    .update({
      name,
      goal: input.goal?.trim() || null,
    })
    .eq("id", input.planId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePlans();
  return { success: true, error: null };
}

export async function deletePlan(planId: string): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("training_plans")
    .delete()
    .eq("id", planId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePlans();
  return { success: true, error: null };
}

export async function setActivePlan(planId: string): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error: deactivateError } = await deactivateAllPlans(supabase, user.id);
  if (deactivateError) {
    return { success: false, error: deactivateError.message };
  }

  const { error } = await supabase
    .from("training_plans")
    .update({ is_active: true })
    .eq("id", planId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePlans();
  return { success: true, error: null };
}

export async function createPlannedWorkout(input: {
  planId: string;
  name: string;
  notes?: string;
}): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();
  const name = input.name.trim();

  if (!name) {
    return { success: false, error: "Workout name is required." };
  }

  const { count, error: countError } = await supabase
    .from("planned_workouts")
    .select("*", { count: "exact", head: true })
    .eq("plan_id", input.planId)
    .eq("user_id", user.id);

  if (countError) {
    return { success: false, error: countError.message };
  }

  const { error } = await supabase.from("planned_workouts").insert({
    plan_id: input.planId,
    user_id: user.id,
    name,
    notes: input.notes?.trim() || null,
    sort_order: count ?? 0,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePlans();
  return { success: true, error: null };
}

export async function deletePlannedWorkout(workoutId: string): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("planned_workouts")
    .delete()
    .eq("id", workoutId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePlans();
  return { success: true, error: null };
}

export async function createPlannedExercise(input: {
  workoutId: string;
  exerciseName: string;
  sets?: string;
  reps?: string;
  weightKg?: string;
  notes?: string;
}): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();
  const exerciseName = input.exerciseName.trim();

  if (!exerciseName) {
    return { success: false, error: "Exercise name is required." };
  }

  const sets = input.sets?.trim() ? Number(input.sets) : null;
  if (sets !== null && (!Number.isInteger(sets) || sets <= 0)) {
    return { success: false, error: "Sets must be a positive whole number." };
  }

  const weightKg = input.weightKg?.trim() ? Number(input.weightKg) : null;
  if (weightKg !== null && (!Number.isFinite(weightKg) || weightKg <= 0)) {
    return { success: false, error: "Weight must be a positive number." };
  }

  const { count, error: countError } = await supabase
    .from("planned_exercises")
    .select("*", { count: "exact", head: true })
    .eq("planned_workout_id", input.workoutId)
    .eq("user_id", user.id);

  if (countError) {
    return { success: false, error: countError.message };
  }

  const { error } = await supabase.from("planned_exercises").insert({
    planned_workout_id: input.workoutId,
    user_id: user.id,
    exercise_name: exerciseName,
    sets,
    reps: input.reps?.trim() || null,
    weight_kg: weightKg,
    notes: input.notes?.trim() || null,
    sort_order: count ?? 0,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePlans();
  return { success: true, error: null };
}

export async function updatePlannedExercise(input: {
  exerciseId: string;
  exerciseName: string;
  sets?: string;
  reps?: string;
  weightKg?: string;
  notes?: string;
}): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();
  const exerciseName = input.exerciseName.trim();

  if (!exerciseName) {
    return { success: false, error: "Exercise name is required." };
  }

  const sets = input.sets?.trim() ? Number(input.sets) : null;
  if (sets !== null && (!Number.isInteger(sets) || sets <= 0)) {
    return { success: false, error: "Sets must be a positive whole number." };
  }

  const weightKg = input.weightKg?.trim() ? Number(input.weightKg) : null;
  if (weightKg !== null && (!Number.isFinite(weightKg) || weightKg <= 0)) {
    return { success: false, error: "Weight must be a positive number." };
  }

  const { error } = await supabase
    .from("planned_exercises")
    .update({
      exercise_name: exerciseName,
      sets,
      reps: input.reps?.trim() || null,
      weight_kg: weightKg,
      notes: input.notes?.trim() || null,
    })
    .eq("id", input.exerciseId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePlans();
  return { success: true, error: null };
}

export async function deletePlannedExercise(exerciseId: string): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("planned_exercises")
    .delete()
    .eq("id", exerciseId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePlans();
  return { success: true, error: null };
}

export async function saveWorkoutLog(input: {
  date: string;
  workoutType: string;
  rawText: string;
}): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const parsedDate = new Date(`${input.date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return { success: false, error: "Date is invalid." };
  }

  const rawText = input.rawText.trim();
  if (!rawText) {
    return { success: false, error: "Workout log text is required." };
  }

  const { error } = await supabase.from("workout_logs").insert({
    user_id: user.id,
    date: parsedDate.toLocaleDateString("en-CA"),
    workout_type: input.workoutType.trim() || null,
    raw_text: rawText,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/plans");
  revalidatePath("/dashboard");
  revalidatePath("/progress");
  return { success: true, error: null };
}
