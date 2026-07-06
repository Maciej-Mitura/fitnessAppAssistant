import "server-only";

import { requireUser } from "@/lib/auth/get-user";
import {
  isStoragePathOwnedByUser,
  PROGRESS_PHOTOS_BUCKET,
  PROGRESS_PHOTO_SIGNED_URL_TTL_SECONDS,
} from "@/lib/storage/progress-photos";
import { createClient } from "@/lib/supabase/server";
import type { ProgressPhotoWithUrl } from "@/types/progress-photos";

export async function getProgressPhotosWithSignedUrls(): Promise<ProgressPhotoWithUrl[]> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: photos, error } = await supabase
    .from("progress_photos")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!photos?.length) {
    return [];
  }

  const expiresAt = new Date(
    Date.now() + PROGRESS_PHOTO_SIGNED_URL_TTL_SECONDS * 1000
  ).toISOString();

  const withUrls = await Promise.all(
    photos.map(async (photo) => {
      if (!isStoragePathOwnedByUser(photo.storage_path, user.id)) {
        throw new Error("Invalid photo storage path.");
      }

      const { data, error: signedUrlError } = await supabase.storage
        .from(PROGRESS_PHOTOS_BUCKET)
        .createSignedUrl(photo.storage_path, PROGRESS_PHOTO_SIGNED_URL_TTL_SECONDS);

      if (signedUrlError || !data?.signedUrl) {
        throw new Error(signedUrlError?.message ?? "Failed to create signed URL.");
      }

      return {
        ...photo,
        signed_url: data.signedUrl,
        signed_url_expires_at: expiresAt,
      };
    })
  );

  return withUrls;
}
