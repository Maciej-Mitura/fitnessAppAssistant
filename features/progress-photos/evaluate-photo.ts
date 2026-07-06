import "server-only";

import { revalidatePath } from "next/cache";

import { generatePhotoObservation } from "@/lib/ai/photo-evaluation";
import { requireUser } from "@/lib/auth/get-user";
import {
  isStoragePathOwnedByUser,
  PROGRESS_PHOTOS_BUCKET,
} from "@/lib/storage/progress-photos";
import { createClient } from "@/lib/supabase/server";
import type { ProgressPhoto, ProgressPhotoType } from "@/types/progress-photos";

const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const AI_SUPPORTED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

function getMimeTypeFromStoragePath(storagePath: string): string | null {
  const extension = storagePath.split(".").pop()?.toLowerCase();

  if (!extension) {
    return null;
  }

  if (extension === "jpeg") {
    return "image/jpeg";
  }

  return EXTENSION_TO_MIME[extension] ?? null;
}

async function fetchOwnedPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  photoId: string,
  userId: string
): Promise<ProgressPhoto | null> {
  const { data, error } = await supabase
    .from("progress_photos")
    .select("*")
    .eq("id", photoId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function downloadPhotoAsBase64(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storagePath: string,
  userId: string
): Promise<{ base64: string; mimeType: string }> {
  if (!isStoragePathOwnedByUser(storagePath, userId)) {
    throw new Error("Invalid photo storage path.");
  }

  const mimeType = getMimeTypeFromStoragePath(storagePath);

  if (!mimeType || !AI_SUPPORTED_MIME.has(mimeType)) {
    throw new Error(
      "This image format is not supported for AI analysis. Use JPEG, PNG, or WebP."
    );
  }

  const { data, error } = await supabase.storage
    .from(PROGRESS_PHOTOS_BUCKET)
    .download(storagePath);

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to download photo.");
  }

  const buffer = Buffer.from(await data.arrayBuffer());

  return {
    base64: buffer.toString("base64"),
    mimeType,
  };
}

function toPhotoMeta(photo: ProgressPhoto, label: string) {
  return {
    date: photo.date,
    photoType: photo.photo_type as ProgressPhotoType,
    notes: photo.notes,
    label,
  };
}

export async function evaluateProgressPhoto(input: {
  photoId: string;
  comparisonPhotoId?: string;
}): Promise<{ observation: string }> {
  const user = await requireUser();
  const supabase = await createClient();

  const currentPhoto = await fetchOwnedPhoto(supabase, input.photoId, user.id);

  if (!currentPhoto) {
    throw new Error("Photo not found.");
  }

  let comparisonPhoto: ProgressPhoto | null = null;

  if (input.comparisonPhotoId) {
    if (input.comparisonPhotoId === input.photoId) {
      throw new Error("Choose a different photo to compare.");
    }

    comparisonPhoto = await fetchOwnedPhoto(
      supabase,
      input.comparisonPhotoId,
      user.id
    );

    if (!comparisonPhoto) {
      throw new Error("Comparison photo not found.");
    }
  }

  const images = [
    await downloadPhotoAsBase64(supabase, currentPhoto.storage_path, user.id),
  ];

  if (comparisonPhoto) {
    images.push(
      await downloadPhotoAsBase64(supabase, comparisonPhoto.storage_path, user.id)
    );
  }

  const observation = await generatePhotoObservation({
    current: toPhotoMeta(currentPhoto, "Current photo"),
    comparison: comparisonPhoto
      ? toPhotoMeta(comparisonPhoto, "Comparison photo")
      : null,
    images,
  });

  const { error: updateError } = await supabase
    .from("progress_photos")
    .update({ ai_observation: observation })
    .eq("id", currentPhoto.id)
    .eq("user_id", user.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath("/progress");

  return { observation };
}
