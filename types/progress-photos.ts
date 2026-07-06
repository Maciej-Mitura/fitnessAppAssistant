export const PROGRESS_PHOTO_TYPES = ["front", "side", "back", "other"] as const;

export type ProgressPhotoType = (typeof PROGRESS_PHOTO_TYPES)[number];

export type ProgressPhoto = {
  id: string;
  user_id: string;
  date: string;
  storage_path: string;
  photo_type: ProgressPhotoType;
  notes: string | null;
  ai_observation: string | null;
  created_at: string;
};

export type ProgressPhotoWithUrl = ProgressPhoto & {
  signed_url: string;
  signed_url_expires_at: string;
};

export const PROGRESS_PHOTO_TYPE_LABELS: Record<ProgressPhotoType, string> = {
  front: "Front",
  side: "Side",
  back: "Back",
  other: "Other",
};
