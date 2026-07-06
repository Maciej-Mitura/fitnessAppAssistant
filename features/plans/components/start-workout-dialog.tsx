"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
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
import { ParsedLogPreview } from "@/features/log/components/parsed-log-preview";
import { saveParsedLog } from "@/features/log/save-parsed-log";
import { saveWorkoutLog } from "@/features/plans/actions";
import { getLocalTodayISO } from "@/lib/date";
import type { ParsedLog } from "@/types/parsed-log";

type StartWorkoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutName: string;
  templateText: string;
};

export function StartWorkoutDialog({
  open,
  onOpenChange,
  workoutName,
  templateText,
}: StartWorkoutDialogProps) {
  const router = useRouter();
  const [date, setDate] = useState(getLocalTodayISO());
  const [workoutType, setWorkoutType] = useState(workoutName);
  const [rawText, setRawText] = useState(templateText);
  const [parsedResult, setParsedResult] = useState<ParsedLog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDate(getLocalTodayISO());
      setWorkoutType(workoutName);
      setRawText(templateText);
      setParsedResult(null);
      setError(null);
    }
  }, [open, workoutName, templateText]);

  async function handleAnalyze() {
    setError(null);
    setParsedResult(null);

    if (!rawText.trim()) {
      setError("Enter what you did to analyze.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/ai/parse-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText, date }),
      });

      const payload = (await response.json()) as {
        data?: ParsedLog;
        error?: string;
      };

      if (!response.ok) {
        const message = payload.error ?? "Failed to analyze workout.";
        setError(message);
        toast.error(message);
        return;
      }

      if (!payload.data) {
        setError("No parsed data returned.");
        toast.error("No parsed data returned.");
        return;
      }

      setParsedResult(payload.data);
      toast.success("Workout analyzed. Review and save when ready.");
    } catch {
      const message = "Network error. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleSaveDirect() {
    setIsSaving(true);
    setError(null);

    const result = await saveWorkoutLog({
      date,
      workoutType,
      rawText,
    });

    setIsSaving(false);

    if (!result.success) {
      setError(result.error);
      toast.error(result.error ?? "Failed to save workout.");
      return;
    }

    toast.success("Workout logged.");
    onOpenChange(false);
    router.refresh();
  }

  async function handleSaveParsed() {
    if (!parsedResult) return;

    setIsSaving(true);
    setError(null);

    const result = await saveParsedLog({
      date,
      rawText,
      parsed: parsedResult,
    });

    setIsSaving(false);

    if (!result.success) {
      setError(result.error);
      toast.error(result.error ?? "Failed to save parsed workout.");
      return;
    }

    toast.success("Workout saved with AI parsing.");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Log workout</DialogTitle>
          <DialogDescription>
            Record what you actually did. Save directly or analyze with AI first.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="workout-date">Date</Label>
              <Input
                id="workout-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                disabled={isAnalyzing || isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workout-type">Workout name</Label>
              <Input
                id="workout-type"
                value={workoutType}
                onChange={(event) => setWorkoutType(event.target.value)}
                disabled={isAnalyzing || isSaving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workout-log">What you did</Label>
            <Textarea
              id="workout-log"
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              rows={8}
              placeholder="Bench 80kg 5x5, incline DB 3x10…"
              disabled={isAnalyzing || isSaving}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {parsedResult ? (
            <ParsedLogPreview
              result={parsedResult}
              onSave={handleSaveParsed}
              isSaving={isSaving}
            />
          ) : null}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDirect}
            disabled={isAnalyzing || isSaving}
          >
            {isSaving ? "Saving…" : "Save log"}
          </Button>
          <Button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || isSaving}
          >
            <Sparkles className="size-3.5" />
            {isAnalyzing ? "Analyzing…" : "Analyze with AI"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
