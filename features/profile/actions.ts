"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

export type SaveProfileState = {
  success: boolean;
  message: string | null;
  error: string | null;
};

function parseOptionalText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

type ParseResult<T> =
  | { value: T }
  | { error: string }
  | null;

function parseHeightCm(value: FormDataEntryValue | null): ParseResult<number> {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 300) {
    return { error: "Height must be a positive number up to 300 cm." };
  }

  return { value: parsed };
}

function parseBirthDate(value: FormDataEntryValue | null): ParseResult<Date> {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return { error: "Birth date is invalid." };
  }

  if (parsed > new Date()) {
    return { error: "Birth date cannot be in the future." };
  }

  return { value: parsed };
}

export async function saveProfile(
  _prevState: SaveProfileState,
  formData: FormData
): Promise<SaveProfileState> {
  const user = await requireUser();
  const supabase = await createClient();

  const displayName = parseOptionalText(formData.get("display_name"));
  const goal = parseOptionalText(formData.get("goal"));
  const injuryNotes = parseOptionalText(formData.get("injury_notes"));

  const heightResult = parseHeightCm(formData.get("height_cm"));
  if (heightResult && "error" in heightResult) {
    return { success: false, message: null, error: heightResult.error };
  }

  const birthDateResult = parseBirthDate(formData.get("birth_date"));
  if (birthDateResult && "error" in birthDateResult) {
    return { success: false, message: null, error: birthDateResult.error };
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      display_name: displayName,
      height_cm: heightResult?.value ?? null,
      birth_date: birthDateResult?.value
        ? birthDateResult.value.toISOString().slice(0, 10)
        : null,
      goal,
      injury_notes: injuryNotes,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return {
      success: false,
      message: null,
      error: error.message,
    };
  }

  revalidatePath("/profile");

  return {
    success: true,
    message: "Profile saved.",
    error: null,
  };
}
