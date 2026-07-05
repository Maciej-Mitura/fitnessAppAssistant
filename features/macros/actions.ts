"use server";

import { revalidatePath } from "next/cache";

import { subtractDaysISO } from "@/features/macros/utils";
import { requireUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

export type SaveMacroTargetState = {
  success: boolean;
  message: string | null;
  error: string | null;
};

function parseRequiredInt(
  value: FormDataEntryValue | null,
  label: string,
  max = 10000
): { value: number } | { error: string } {
  if (typeof value !== "string" || value.trim() === "") {
    return { error: `${label} is required.` };
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > max) {
    return { error: `${label} must be a whole number between 1 and ${max.toLocaleString()}.` };
  }

  return { value: parsed };
}

function parseActiveFrom(
  value: FormDataEntryValue | null
): { value: Date } | { error: string } {
  if (typeof value !== "string" || value.trim() === "") {
    return { error: "Active from date is required." };
  }

  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return { error: "Active from date is invalid." };
  }

  return { value: parsed };
}

export async function createMacroTarget(
  _prevState: SaveMacroTargetState,
  formData: FormData
): Promise<SaveMacroTargetState> {
  const user = await requireUser();
  const supabase = await createClient();

  const caloriesResult = parseRequiredInt(formData.get("calories"), "Calories", 15000);
  if ("error" in caloriesResult) {
    return { success: false, message: null, error: caloriesResult.error };
  }

  const proteinResult = parseRequiredInt(formData.get("protein_g"), "Protein", 1000);
  if ("error" in proteinResult) {
    return { success: false, message: null, error: proteinResult.error };
  }

  const carbsResult = parseRequiredInt(formData.get("carbs_g"), "Carbs", 2000);
  if ("error" in carbsResult) {
    return { success: false, message: null, error: carbsResult.error };
  }

  const fatResult = parseRequiredInt(formData.get("fat_g"), "Fat", 1000);
  if ("error" in fatResult) {
    return { success: false, message: null, error: fatResult.error };
  }

  const activeFromResult = parseActiveFrom(formData.get("active_from"));
  if ("error" in activeFromResult) {
    return { success: false, message: null, error: activeFromResult.error };
  }

  const activeFrom = activeFromResult.value.toLocaleDateString("en-CA");
  const closeDate = subtractDaysISO(activeFrom, 1);

  const calories = caloriesResult.value;
  const protein_g = proteinResult.value;
  const carbs_g = carbsResult.value;
  const fat_g = fatResult.value;

  const { error: closeError } = await supabase
    .from("macro_targets")
    .update({ active_until: closeDate })
    .eq("user_id", user.id)
    .is("active_until", null);

  if (closeError) {
    return { success: false, message: null, error: closeError.message };
  }

  const { error: insertError } = await supabase.from("macro_targets").insert({
    user_id: user.id,
    calories,
    protein_g,
    carbs_g,
    fat_g,
    active_from: activeFrom,
  });

  if (insertError) {
    return { success: false, message: null, error: insertError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath("/profile");

  return {
    success: true,
    message: "Macro targets updated.",
    error: null,
  };
}
