"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/get-user";
import { PROGRESS_PHOTOS_BUCKET } from "@/lib/storage/progress-photos";
import { createClient } from "@/lib/supabase/server";
import type { SettingsActionResult, UserExportPayload } from "@/features/settings/types";

function revalidateUserData() {
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/log");
  revalidatePath("/progress");
  revalidatePath("/profile");
  revalidatePath("/coach");
  revalidatePath("/plans");
}

export async function exportUserData(): Promise<
  SettingsActionResult & { data?: string }
> {
  const user = await requireUser();
  const supabase = await createClient();

  const [
    { data: profile, error: profileError },
    { data: macroTargets, error: macroError },
    { data: dailyLogs, error: dailyError },
    { data: bodyMetrics, error: bodyError },
    { data: workoutLogs, error: workoutError },
    { data: exerciseLogs, error: exerciseError },
    { data: specialEvents, error: eventsError },
    { data: progressPhotos, error: photosError },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("macro_targets").select("*").eq("user_id", user.id).order("active_from", { ascending: false }),
    supabase.from("daily_logs").select("*").eq("user_id", user.id).order("date", { ascending: false }),
    supabase.from("body_metrics").select("*").eq("user_id", user.id).order("date", { ascending: false }),
    supabase.from("workout_logs").select("*").eq("user_id", user.id).order("date", { ascending: false }),
    supabase.from("exercise_logs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("special_events").select("*").eq("user_id", user.id).order("date", { ascending: false }),
    supabase
      .from("progress_photos")
      .select("id, date, photo_type, notes, ai_observation, created_at")
      .eq("user_id", user.id)
      .order("date", { ascending: false }),
  ]);

  const errors = [
    profileError,
    macroError,
    dailyError,
    bodyError,
    workoutError,
    exerciseError,
    eventsError,
    photosError,
  ].filter(Boolean);

  if (errors.length > 0) {
    return {
      success: false,
      error: errors[0]?.message ?? "Failed to export data.",
    };
  }

  const payload: UserExportPayload = {
    exported_at: new Date().toISOString(),
    user_id: user.id,
    profile: profile ?? null,
    macro_targets: macroTargets ?? [],
    daily_logs: dailyLogs ?? [],
    body_metrics: bodyMetrics ?? [],
    workout_logs: workoutLogs ?? [],
    exercise_logs: exerciseLogs ?? [],
    special_events: specialEvents ?? [],
    progress_photos: progressPhotos ?? [],
  };

  return {
    success: true,
    error: null,
    data: JSON.stringify(payload, null, 2),
  };
}

export async function deleteAllLogs(): Promise<SettingsActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error: workoutError } = await supabase
    .from("workout_logs")
    .delete()
    .eq("user_id", user.id);

  if (workoutError) {
    return { success: false, error: workoutError.message };
  }

  const deletions = await Promise.all([
    supabase.from("daily_logs").delete().eq("user_id", user.id),
    supabase.from("body_metrics").delete().eq("user_id", user.id),
    supabase.from("special_events").delete().eq("user_id", user.id),
  ]);

  const deleteError = deletions.find((result) => result.error)?.error;
  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  revalidateUserData();
  return { success: true, error: null };
}

export async function deleteAllProgressPhotos(): Promise<SettingsActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: photos, error: fetchError } = await supabase
    .from("progress_photos")
    .select("id, storage_path")
    .eq("user_id", user.id);

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  if (photos?.length) {
    const storagePaths = photos.map((photo) => photo.storage_path);

    const { error: storageError } = await supabase.storage
      .from(PROGRESS_PHOTOS_BUCKET)
      .remove(storagePaths);

    if (storageError) {
      return { success: false, error: storageError.message };
    }
  }

  const { error: deleteError } = await supabase
    .from("progress_photos")
    .delete()
    .eq("user_id", user.id);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  revalidateUserData();
  return { success: true, error: null };
}
