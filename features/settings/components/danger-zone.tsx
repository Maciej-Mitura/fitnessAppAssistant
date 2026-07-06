"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { deleteAllLogs, deleteAllProgressPhotos } from "@/features/settings/actions";

type DangerAction = "logs" | "photos" | null;

const CONFIRM_PHRASES = {
  logs: "DELETE LOGS",
  photos: "DELETE PHOTOS",
} as const;

export function DangerZone() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<DangerAction>(null);
  const [confirmText, setConfirmText] = useState("");

  const requiredPhrase = activeAction ? CONFIRM_PHRASES[activeAction] : "";
  const canConfirm = confirmText === requiredPhrase;

  function closeDialog() {
    setActiveAction(null);
    setConfirmText("");
  }

  function handleConfirm() {
    if (!activeAction || !canConfirm) {
      return;
    }

    startTransition(async () => {
      const result =
        activeAction === "logs"
          ? await deleteAllLogs()
          : await deleteAllProgressPhotos();

      if (!result.success) {
        toast.error(result.error ?? "Action failed.");
        return;
      }

      toast.success(
        activeAction === "logs"
          ? "All logs deleted."
          : "All progress photos deleted."
      );
      closeDialog();
      router.refresh();
    });
  }

  return (
    <>
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" />
            <CardTitle className="text-destructive">Danger zone</CardTitle>
          </div>
          <CardDescription>
            Destructive actions cannot be undone. Your account, profile, macro targets,
            and training plans are not affected.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-3 rounded-lg border border-destructive/20 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Delete all logs</p>
              <p className="text-xs text-muted-foreground">
                Removes daily logs, body metrics, workouts, exercises, and special events.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setActiveAction("logs")}
              disabled={isPending}
              className="shrink-0"
            >
              <Trash2 className="size-3.5" />
              Delete logs
            </Button>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-destructive/20 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Delete all progress photos</p>
              <p className="text-xs text-muted-foreground">
                Removes photo metadata and files from your private storage bucket.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setActiveAction("photos")}
              disabled={isPending}
              className="shrink-0"
            >
              <Trash2 className="size-3.5" />
              Delete photos
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(activeAction)}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {activeAction === "logs"
                ? "Delete all logs?"
                : "Delete all progress photos?"}
            </DialogTitle>
            <DialogDescription>
              This permanently deletes your data and cannot be undone. Type{" "}
              <span className="font-mono font-medium text-foreground">
                {requiredPhrase}
              </span>{" "}
              to confirm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="danger-confirm">Confirmation</Label>
            <Input
              id="danger-confirm"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder={requiredPhrase}
              disabled={isPending}
              autoComplete="off"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={isPending || !canConfirm}
            >
              {isPending ? "Deleting…" : "Confirm delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
