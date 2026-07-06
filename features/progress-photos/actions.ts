"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/get-user";
import {
  buildProgressPhotoStoragePath,
  getExtensionForMimeType,
  isStoragePathOwnedByUser,
  isValidProgressPhotoType,
  parseProgressPhotoDate,
  PROGRESS_PHOTOS_BUCKET,
  PROGRESS_PHOTO_MAX_BYTES,
  PROGRESS_PHOTO_ALLOWED_MIME_TYPES,
} from "@/lib/storage/progress-photos";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = {
  success: boolean;
  error: string | null;
};

export type PrepareUploadResult =
  | ActionResult & {
      photoId?: string;
      storagePath?: string;
    };

function revalidateProgressPhotos() {
  revalidatePath("/progress");
}

export async function prepareProgressPhotoUpload(input: {
  mimeType: string;
  fileSize: number;
}): Promise<PrepareUploadResult> {
  const user = await requireUser();

  if (!PROGRESS_PHOTO_ALLOWED_MIME_TYPES.includes(input.mimeType as (typeof PROGRESS_PHOTO_ALLOWED_MIME_TYPES)[number])) {
    return { success: false, error: "Only JPEG, PNG, WebP, or HEIC images are allowed." };
  }

  if (input.fileSize <= 0 || input.fileSize > PROGRESS_PHOTO_MAX_BYTES) {
    return { success: false, error: "Image must be 10 MB or smaller." };
  }

  const extension = getExtensionForMimeType(input.mimeType);
  if (!extension) {
    return { success: false, error: "Unsupported image type." };
  }

  const photoId = crypto.randomUUID();
  const storagePath = buildProgressPhotoStoragePath(user.id, photoId, extension);

  if (!isStoragePathOwnedByUser(storagePath, user.id)) {
    return { success: false, error: "Invalid storage path." };
  }

  return {
    success: true,
    error: null,
    photoId,
    storagePath,
  };
}

export async function saveProgressPhoto(input: {
  photoId: string;
  storagePath: string;
  date: string;
  photoType: string;
  notes?: string;
}): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  if (!isValidProgressPhotoType(input.photoType)) {
    return { success: false, error: "Photo type is invalid." };
  }

  const dateResult = parseProgressPhotoDate(input.date);
  if ("error" in dateResult) {
    return { success: false, error: dateResult.error };
  }

  if (!isStoragePathOwnedByUser(input.storagePath, user.id)) {
    return { success: false, error: "You can only save your own photos." };
  }

  const expectedPrefix = `${user.id}/${input.photoId}.`;
  if (!input.storagePath.startsWith(expectedPrefix)) {
    return { success: false, error: "Storage path does not match the photo." };
  }

  const { data: existingFile, error: fileError } = await supabase.storage
    .from(PROGRESS_PHOTOS_BUCKET)
    .createSignedUrl(input.storagePath, 60);

  if (fileError || !existingFile?.signedUrl) {
    return { success: false, error: "Uploaded image not found. Please try again." };
  }

  const { error } = await supabase.from("progress_photos").insert({
    id: input.photoId,
    user_id: user.id,
    date: dateResult.value,
    storage_path: input.storagePath,
    photo_type: input.photoType,
    notes: input.notes?.trim() || null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateProgressPhotos();
  return { success: true, error: null };
}

export async function deleteProgressPhoto(photoId: string): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: photo, error: fetchError } = await supabase
    .from("progress_photos")
    .select("id, user_id, storage_path")
    .eq("id", photoId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  if (!photo) {
    return { success: false, error: "Photo not found." };
  }

  if (!isStoragePathOwnedByUser(photo.storage_path, user.id)) {
    return { success: false, error: "You can only delete your own photos." };
  }

  const { error: storageError } = await supabase.storage
    .from(PROGRESS_PHOTOS_BUCKET)
    .remove([photo.storage_path]);

  if (storageError) {
    return { success: false, error: storageError.message };
  }

  const { error: deleteError } = await supabase
    .from("progress_photos")
    .delete()
    .eq("id", photoId)
    .eq("user_id", user.id);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  revalidateProgressPhotos();
  return { success: true, error: null };
}
