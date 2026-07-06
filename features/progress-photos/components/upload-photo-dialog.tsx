"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  prepareProgressPhotoUpload,
  saveProgressPhoto,
} from "@/features/progress-photos/actions";
import { getLocalTodayISO } from "@/lib/date";
import { PROGRESS_PHOTOS_BUCKET } from "@/lib/storage/progress-photos";
import { createClient } from "@/lib/supabase/client";
import {
  PROGRESS_PHOTO_TYPES,
  PROGRESS_PHOTO_TYPE_LABELS,
  type ProgressPhotoType,
} from "@/types/progress-photos";
import { cn } from "@/lib/utils";

const selectClassName = cn(
  "flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30"
);

type UploadPhotoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UploadPhotoDialog({ open, onOpenChange }: UploadPhotoDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState(getLocalTodayISO());
  const [photoType, setPhotoType] = useState<ProgressPhotoType>("front");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function resetForm() {
    setDate(getLocalTodayISO());
    setPhotoType("front");
    setNotes("");
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!selectedFile) {
      toast.error("Choose a photo to upload.");
      return;
    }

    startTransition(async () => {
      const prepareResult = await prepareProgressPhotoUpload({
        mimeType: selectedFile.type,
        fileSize: selectedFile.size,
      });

      if (
        !prepareResult.success ||
        !prepareResult.photoId ||
        !prepareResult.storagePath
      ) {
        toast.error(prepareResult.error ?? "Could not prepare upload.");
        return;
      }

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(PROGRESS_PHOTOS_BUCKET)
        .upload(prepareResult.storagePath, selectedFile, {
          contentType: selectedFile.type,
          upsert: false,
        });

      if (uploadError) {
        toast.error(uploadError.message);
        return;
      }

      const saveResult = await saveProgressPhoto({
        photoId: prepareResult.photoId,
        storagePath: prepareResult.storagePath,
        date,
        photoType,
        notes,
      });

      if (!saveResult.success) {
        await supabase.storage
          .from(PROGRESS_PHOTOS_BUCKET)
          .remove([prepareResult.storagePath]);
        toast.error(saveResult.error ?? "Failed to save photo.");
        return;
      }

      toast.success("Progress photo uploaded.");
      handleOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload progress photo</DialogTitle>
          <DialogDescription>
            Photos are stored in your private bucket and never made public.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="photo-file">Photo</Label>
            <input
              ref={fileInputRef}
              id="photo-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              onChange={handleFileChange}
              disabled={isPending}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
              className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Selected progress photo preview"
                  className="max-h-48 w-full rounded-lg object-contain"
                />
              ) : (
                <>
                  <ImagePlus className="size-6" />
                  <span>Tap to choose a photo</span>
                  <span className="text-xs">JPEG, PNG, WebP, or HEIC · max 10 MB</span>
                </>
              )}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="photo-date">Date</Label>
              <Input
                id="photo-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo-type">Photo type</Label>
              <select
                id="photo-type"
                value={photoType}
                onChange={(event) =>
                  setPhotoType(event.target.value as ProgressPhotoType)
                }
                disabled={isPending}
                className={selectClassName}
              >
                {PROGRESS_PHOTO_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {PROGRESS_PHOTO_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo-notes">Note (optional)</Label>
            <Textarea
              id="photo-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Post-vacation check-in, 12 weeks into cut…"
              rows={3}
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending || !selectedFile} className="w-full sm:w-auto">
              {isPending ? "Uploading…" : "Upload photo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
