import type { ProgressPhotoType } from "@/types/progress-photos";

export const PROGRESS_PHOTOS_BUCKET = "progress-photos";

export const PROGRESS_PHOTO_MAX_BYTES = 10 * 1024 * 1024;

export const PROGRESS_PHOTO_SIGNED_URL_TTL_SECONDS = 3600;

export const PROGRESS_PHOTO_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

export function getExtensionForMimeType(mimeType: string): string | null {
  return MIME_TO_EXTENSION[mimeType] ?? null;
}

export function buildProgressPhotoStoragePath(
  userId: string,
  photoId: string,
  extension: string
) {
  return `${userId}/${photoId}.${extension}`;
}

export function isStoragePathOwnedByUser(storagePath: string, userId: string) {
  return storagePath.startsWith(`${userId}/`);
}

export function isValidProgressPhotoType(value: string): value is ProgressPhotoType {
  return value === "front" || value === "side" || value === "back" || value === "other";
}

export function parseProgressPhotoDate(date: string): { value: string } | { error: string } {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return { error: "Date is invalid." };
  }

  return { value: parsed.toLocaleDateString("en-CA") };
}
