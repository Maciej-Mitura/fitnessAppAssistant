"use client";

import { useState, useTransition } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { exportUserData } from "@/features/settings/actions";

export function DataExportButton() {
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      const result = await exportUserData();

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Failed to export data.");
        return;
      }

      const blob = new Blob([result.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.download = `fitos-export-${date}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Data exported.");
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Download your profile, targets, logs, workouts, and progress photo metadata as
        JSON. Photo files and signed URLs are not included.
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={handleExport}
        disabled={isPending}
        className="w-full sm:w-auto"
      >
        <Download className="size-4" />
        {isPending ? "Preparing export…" : "Export my data"}
      </Button>
    </div>
  );
}
