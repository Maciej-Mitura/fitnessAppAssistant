"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PhotoDetailDialog } from "@/features/progress-photos/components/photo-detail-dialog";
import { PhotoGrid } from "@/features/progress-photos/components/photo-grid";
import { PhotoEmptyState } from "@/features/progress-photos/components/photo-empty-state";
import { UploadPhotoDialog } from "@/features/progress-photos/components/upload-photo-dialog";
import { groupPhotosByDate } from "@/features/progress-photos/utils";
import { formatDisplayDate } from "@/lib/date";
import type { ProgressPhotoWithUrl } from "@/types/progress-photos";

type ProgressPhotosSectionProps = {
  photos: ProgressPhotoWithUrl[];
};

export function ProgressPhotosSection({ photos }: ProgressPhotosSectionProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhotoWithUrl | null>(null);
  const timeline = groupPhotosByDate(photos);

  return (
    <section className="space-y-4">
      <Separator className="opacity-50" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Progress photos</h2>
          <p className="text-sm text-muted-foreground">
            Private timeline of front, side, and back photos.
          </p>
        </div>
        <Button type="button" onClick={() => setUploadOpen(true)}>
          <Plus className="size-4" />
          Add photo
        </Button>
      </div>

      {photos.length === 0 ? (
        <PhotoEmptyState />
      ) : (
        <div className="space-y-6">
          {timeline.map((group) => (
            <div key={group.date} className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                {formatDisplayDate(group.date)}
              </h3>
              <PhotoGrid
                photos={group.photos}
                onSelectPhoto={setSelectedPhoto}
              />
            </div>
          ))}
        </div>
      )}

      <UploadPhotoDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <PhotoDetailDialog
        photo={selectedPhoto}
        allPhotos={photos}
        open={Boolean(selectedPhoto)}
        onOpenChange={(open) => {
          if (!open) setSelectedPhoto(null);
        }}
      />
    </section>
  );
}
