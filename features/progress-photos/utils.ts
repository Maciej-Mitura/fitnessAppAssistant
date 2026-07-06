import type { ProgressPhotoWithUrl } from "@/types/progress-photos";

export function groupPhotosByDate(photos: ProgressPhotoWithUrl[]) {
  const groups = new Map<string, ProgressPhotoWithUrl[]>();

  for (const photo of photos) {
    const list = groups.get(photo.date) ?? [];
    list.push(photo);
    groups.set(photo.date, list);
  }

  return Array.from(groups.entries()).map(([date, items]) => ({
    date,
    photos: items,
  }));
}

export function findStartingPhotoId(
  current: ProgressPhotoWithUrl,
  photos: ProgressPhotoWithUrl[]
): string | null {
  const others = photos.filter((photo) => photo.id !== current.id);

  if (!others.length) {
    return null;
  }

  const sameType = others
    .filter((photo) => photo.photo_type === current.photo_type)
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || a.created_at.localeCompare(b.created_at)
    );

  if (sameType.length > 0) {
    return sameType[0].id;
  }

  const earliest = [...others].sort(
    (a, b) =>
      a.date.localeCompare(b.date) || a.created_at.localeCompare(b.created_at)
  );

  return earliest[0]?.id ?? null;
}
