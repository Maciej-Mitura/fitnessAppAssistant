"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

export type SaveDailyLogState = {
  success: boolean;
  message: string | null;
  error: string | null;
};

function parseDate(value: FormDataEntryValue | null): { value: string } | { error: string } {
  if (typeof value !== "string" || value.trim() === "") {
    return { error: "Date is required." };
  }

  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return { error: "Date is invalid." };
  }

  return { value: parsed.toLocaleDateString("en-CA") };
}

function parseOptionalWeight(
  value: FormDataEntryValue | null
): { value: number } | { error: string } | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 500) {
    return { error: "Weight must be a positive number up to 500 kg." };
  }

  return { value: parsed };
}

function parseOptionalInt(
  value: FormDataEntryValue | null,
  label: string,
  max = 15000
): { value: number } | { error: string } | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0 || parsed > max) {
    return {
      error: `${label} must be a whole number between 0 and ${max.toLocaleString()}.`,
    };
  }

  return { value: parsed };
}

function parseNotes(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "—";
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "—";
}

export async function saveDailyLog(
  _prevState: SaveDailyLogState,
  formData: FormData
): Promise<SaveDailyLogState> {
  const user = await requireUser();
  const supabase = await createClient();

  const dateResult = parseDate(formData.get("date"));
  if ("error" in dateResult) {
    return { success: false, message: null, error: dateResult.error };
  }

  const weightResult = parseOptionalWeight(formData.get("weight_kg"));
  if (weightResult && "error" in weightResult) {
    return { success: false, message: null, error: weightResult.error };
  }

  const caloriesResult = parseOptionalInt(formData.get("calories"), "Calories");
  if (caloriesResult && "error" in caloriesResult) {
    return { success: false, message: null, error: caloriesResult.error };
  }

  const proteinResult = parseOptionalInt(formData.get("protein_g"), "Protein", 1000);
  if (proteinResult && "error" in proteinResult) {
    return { success: false, message: null, error: proteinResult.error };
  }

  const carbsResult = parseOptionalInt(formData.get("carbs_g"), "Carbs", 2000);
  if (carbsResult && "error" in carbsResult) {
    return { success: false, message: null, error: carbsResult.error };
  }

  const fatResult = parseOptionalInt(formData.get("fat_g"), "Fat", 1000);
  if (fatResult && "error" in fatResult) {
    return { success: false, message: null, error: fatResult.error };
  }

  const date = dateResult.value;
  const rawText = parseNotes(formData.get("raw_text"));
  const hasMacros = [caloriesResult, proteinResult, carbsResult, fatResult].some(
    (result) => result && "value" in result
  );
  const hasWeight = weightResult && "value" in weightResult;

  if (!hasWeight && !hasMacros && rawText === "—") {
    return {
      success: false,
      message: null,
      error: "Add bodyweight, macros, or notes before saving.",
    };
  }

  if (hasWeight) {
    const weightKg = weightResult.value;

    const { data: existingMetric } = await supabase
      .from("body_metrics")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", date)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingMetric) {
      const { error: updateError } = await supabase
        .from("body_metrics")
        .update({ weight_kg: weightKg })
        .eq("id", existingMetric.id)
        .eq("user_id", user.id);

      if (updateError) {
        return { success: false, message: null, error: updateError.message };
      }
    } else {
      const { error: insertMetricError } = await supabase.from("body_metrics").insert({
        user_id: user.id,
        date,
        weight_kg: weightKg,
      });

      if (insertMetricError) {
        return { success: false, message: null, error: insertMetricError.message };
      }
    }
  }

  const { error: logError } = await supabase.from("daily_logs").insert({
    user_id: user.id,
    date,
    raw_text: rawText,
    calories: caloriesResult && "value" in caloriesResult ? caloriesResult.value : null,
    protein_g: proteinResult && "value" in proteinResult ? proteinResult.value : null,
    carbs_g: carbsResult && "value" in carbsResult ? carbsResult.value : null,
    fat_g: fatResult && "value" in fatResult ? fatResult.value : null,
  });

  if (logError) {
    return { success: false, message: null, error: logError.message };
  }

  revalidatePath("/log");
  revalidatePath("/dashboard");
  revalidatePath("/progress");
  revalidatePath("/profile");

  return {
    success: true,
    message: "Daily log saved.",
    error: null,
  };
}
