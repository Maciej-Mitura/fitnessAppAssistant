"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { deleteProgressPhoto } from "@/features/progress-photos/actions";
import { findStartingPhotoId } from "@/features/progress-photos/utils";
import { formatDisplayDate } from "@/lib/date";
import { PROGRESS_PHOTO_TYPE_LABELS, type ProgressPhotoWithUrl } from "@/types/progress-photos";

type PhotoDetailDialogProps = {
  photo: ProgressPhotoWithUrl | null;
  allPhotos: ProgressPhotoWithUrl[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PhotoDetailDialog({
  photo,
  allPhotos,
  open,
  onOpenChange,
}: PhotoDetailDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [observation, setObservation] = useState<string | null>(null);

  const startingPhotoId = useMemo(() => {
    if (!photo) return null;
    return findStartingPhotoId(photo, allPhotos);
  }, [photo, allPhotos]);

  useEffect(() => {
    if (photo) {
      setObservation(photo.ai_observation);
    }
  }, [photo]);

  async function runEvaluation(comparisonPhotoId?: string) {
    if (!photo) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/ai/photo-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId: photo.id,
          comparisonPhotoId,
        }),
      });

      const payload = (await response.json()) as {
        observation?: string;
        error?: string;
      };

      if (!response.ok) {
        toast.error(payload.error ?? "Failed to analyze photo.");
        return;
      }

      if (!payload.observation) {
        toast.error("No analysis returned.");
        return;
      }

      setObservation(payload.observation);
      toast.success(
        comparisonPhotoId ? "Comparison analysis saved." : "Photo analysis saved."
      );
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleDelete() {
    if (!photo) return;

    if (!window.confirm("Delete this progress photo? This cannot be undone.")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteProgressPhoto(photo.id);

      if (!result.success) {
        toast.error(result.error ?? "Failed to delete photo.");
        return;
      }

      toast.success("Photo deleted.");
      onOpenChange(false);
      router.refresh();
    });
  }

  if (!photo) return null;

  const canCompare = Boolean(startingPhotoId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-md">
        <div className="relative aspect-[3/4] w-full bg-muted">
          <Image
            src={photo.signed_url}
            alt={`${PROGRESS_PHOTO_TYPE_LABELS[photo.photo_type]} progress photo`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 448px"
            unoptimized
          />
        </div>

        <div className="space-y-4 p-4">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <DialogTitle>{formatDisplayDate(photo.date)}</DialogTitle>
              <Badge variant="secondary">
                {PROGRESS_PHOTO_TYPE_LABELS[photo.photo_type]}
              </Badge>
            </div>
            <DialogDescription>
              Private photo — visible only to you via a temporary signed link.
            </DialogDescription>
          </DialogHeader>

          {photo.notes ? (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Note
              </p>
              <p className="text-sm">{photo.notes}</p>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => runEvaluation()}
              disabled={isAnalyzing || isPending}
              className="w-full sm:flex-1"
            >
              <Sparkles className="size-3.5" />
              {isAnalyzing ? "Analyzing…" : "Analyze photo"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => startingPhotoId && runEvaluation(startingPhotoId)}
              disabled={isAnalyzing || isPending || !canCompare}
              className="w-full sm:flex-1"
            >
              <Sparkles className="size-3.5" />
              Compare with starting photo
            </Button>
          </div>

          {!canCompare ? (
            <p className="text-xs text-muted-foreground">
              Upload another photo to enable comparison with your earliest check-in.
            </p>
          ) : null}

          {observation ? (
            <>
              <Separator className="opacity-50" />
              <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  AI observation
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{observation}</p>
              </div>
            </>
          ) : null}

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending || isAnalyzing}
              className="w-full sm:w-auto"
            >
              <Trash2 className="size-3.5" />
              {isPending ? "Deleting…" : "Delete photo"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
