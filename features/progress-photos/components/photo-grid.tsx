"use client";

import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { formatDisplayDate } from "@/lib/date";
import { PROGRESS_PHOTO_TYPE_LABELS, type ProgressPhotoWithUrl } from "@/types/progress-photos";

type PhotoGridProps = {
  photos: ProgressPhotoWithUrl[];
  onSelectPhoto: (photo: ProgressPhotoWithUrl) => void;
};

export function PhotoGrid({ photos, onSelectPhoto }: PhotoGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
      {photos.map((photo) => (
        <button
          key={photo.id}
          type="button"
          onClick={() => onSelectPhoto(photo)}
          className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-muted text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Image
            src={photo.signed_url}
            alt={`${PROGRESS_PHOTO_TYPE_LABELS[photo.photo_type]} on ${photo.date}`}
            fill
            className="object-cover transition-transform group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2.5">
            <Badge
              variant="secondary"
              className="mb-1 bg-background/80 text-[10px] backdrop-blur-sm"
            >
              {PROGRESS_PHOTO_TYPE_LABELS[photo.photo_type]}
            </Badge>
            <p className="text-xs font-medium text-white">
              {formatDisplayDate(photo.date)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
