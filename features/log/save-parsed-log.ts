"use server";

import { revalidatePath } from "next/cache";

import { validateParsedLog } from "@/lib/ai/validate-parsed-log";
import { requireUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import type { ParsedLog } from "@/types/parsed-log";

export type SaveParsedLogResult = {
  success: boolean;
  error: string | null;
};

function parseDate(date: string): { value: string } | { error: string } {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return { error: "Date is invalid." };
  }

  return { value: parsed.toLocaleDateString("en-CA") };
}

function toInt(value: number | null): number | null {
  if (value === null) {
    return null;
  }

  return Math.round(value);
}

async function upsertBodyWeight(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  date: string,
  weightKg: number
) {
  const { data: existingMetric } = await supabase
    .from("body_metrics")
    .select("id")
    .eq("user_id", userId)
    .eq("date", date)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingMetric) {
    return supabase
      .from("body_metrics")
      .update({ weight_kg: weightKg })
      .eq("id", existingMetric.id)
      .eq("user_id", userId);
  }

  return supabase.from("body_metrics").insert({
    user_id: userId,
    date,
    weight_kg: weightKg,
  });
}

export async function saveParsedLog(input: {
  date: string;
  rawText: string;
  parsed: ParsedLog;
}): Promise<SaveParsedLogResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const dateResult = parseDate(input.date);
  if ("error" in dateResult) {
    return { success: false, error: dateResult.error };
  }

  if (!input.rawText.trim()) {
    return { success: false, error: "Original log text is required." };
  }

  const parsed = validateParsedLog(input.parsed);
  if (!parsed) {
    return { success: false, error: "Parsed data is invalid." };
  }

  const date = dateResult.value;
  const rawText = input.rawText.trim();

  if (parsed.bodyweight_kg !== null) {
    const { error } = await upsertBodyWeight(
      supabase,
      user.id,
      date,
      parsed.bodyweight_kg
    );

    if (error) {
      return { success: false, error: error.message };
    }
  }

  const { error: dailyLogError } = await supabase.from("daily_logs").insert({
    user_id: user.id,
    date,
    raw_text: rawText,
    calories: toInt(parsed.calories),
    protein_g: toInt(parsed.protein_g),
    carbs_g: toInt(parsed.carbs_g),
    fat_g: toInt(parsed.fat_g),
    ai_summary: parsed.summary,
    ai_feedback: parsed.feedback,
  });

  if (dailyLogError) {
    return { success: false, error: dailyLogError.message };
  }

  if (parsed.workout_detected) {
    const { data: workoutLog, error: workoutError } = await supabase
      .from("workout_logs")
      .insert({
        user_id: user.id,
        date,
        workout_type: parsed.workout_type,
        raw_text: rawText,
        ai_summary: parsed.summary,
        pain_notes: null,
        fatigue_score: null,
      })
      .select("id")
      .single();

    if (workoutError) {
      return { success: false, error: workoutError.message };
    }

    if (parsed.exercises.length > 0) {
      const { error: exerciseError } = await supabase.from("exercise_logs").insert(
        parsed.exercises.map((exercise) => ({
          workout_log_id: workoutLog.id,
          user_id: user.id,
          exercise_name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight_kg: exercise.weight_kg,
          notes: exercise.notes,
        }))
      );

      if (exerciseError) {
        return { success: false, error: exerciseError.message };
      }
    }
  }

  const specialEventRows: Array<{
    user_id: string;
    date: string;
    type: string;
    description: string;
  }> = [];

  if (parsed.pain_notes) {
    specialEventRows.push({
      user_id: user.id,
      date,
      type: "pain",
      description: parsed.pain_notes,
    });
  }

  if (parsed.fatigue_notes) {
    specialEventRows.push({
      user_id: user.id,
      date,
      type: "fatigue",
      description: parsed.fatigue_notes,
    });
  }

  for (const event of parsed.special_events) {
    if (event.trim()) {
      specialEventRows.push({
        user_id: user.id,
        date,
        type: "event",
        description: event.trim(),
      });
    }
  }

  if (specialEventRows.length > 0) {
    const { error: eventsError } = await supabase
      .from("special_events")
      .insert(specialEventRows);

    if (eventsError) {
      return { success: false, error: eventsError.message };
    }
  }

  revalidatePath("/log");
  revalidatePath("/dashboard");
  revalidatePath("/progress");
  revalidatePath("/profile");
  revalidatePath("/plans");

  return { success: true, error: null };
}
