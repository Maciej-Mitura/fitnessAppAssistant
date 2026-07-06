"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ParsedLogPreview } from "@/features/log/components/parsed-log-preview";
import { VoiceInputButton } from "@/features/log/components/voice-input-button";
import { saveParsedLog } from "@/features/log/save-parsed-log";
import { getLocalTodayISO } from "@/lib/date";
import type { ParsedLog } from "@/types/parsed-log";

export function AiLogParser() {
  const router = useRouter();
  const [date, setDate] = useState(getLocalTodayISO());
  const [rawText, setRawText] = useState("");
  const [result, setResult] = useState<ParsedLog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);

  async function handleAnalyze() {
    setError(null);
    setResult(null);

    if (!rawText.trim()) {
      setError("Enter a log description to analyze.");
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
        const message = payload.error ?? "Failed to analyze log.";
        setError(message);
        toast.error(message);
        return;
      }

      if (!payload.data) {
        setError("No parsed data returned.");
        toast.error("No parsed data returned.");
        return;
      }

      setResult(payload.data);
      toast.success("Log analyzed. Review and save when ready.");
    } catch {
      const message = "Network error. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleSave() {
    if (!result) {
      return;
    }

    setIsSaving(true);

    try {
      const saveResult = await saveParsedLog({
        date,
        rawText,
        parsed: result,
      });

      if (!saveResult.success) {
        toast.error(saveResult.error ?? "Failed to save log.");
        return;
      }

      toast.success("Log saved successfully.");
      setResult(null);
      setRawText("");
      router.refresh();
    } catch {
      toast.error("Failed to save log. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
              <Sparkles className="size-4" />
            </span>
            <div className="space-y-1">
              <CardTitle>Natural language log</CardTitle>
              <CardDescription>
                Describe your day in plain text — AI will extract structured data.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-date">Date</Label>
            <Input
              id="ai-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              disabled={isAnalyzing || isSaving}
              className="max-w-xs"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="ai-raw-text">What happened today?</Label>
              <VoiceInputButton
                value={rawText}
                onChange={setRawText}
                disabled={isAnalyzing || isSaving}
                onError={setVoiceMessage}
              />
            </div>
            <Textarea
              id="ai-raw-text"
              value={rawText}
              onChange={(event) => {
                setRawText(event.target.value);
                if (voiceMessage) {
                  setVoiceMessage(null);
                }
              }}
              placeholder='e.g. "98.4kg today, ate 2300 kcal, 180 protein, did push day, bench 80kg 5 5 4, knee felt weird"'
              rows={6}
              disabled={isAnalyzing || isSaving}
              className="min-h-32 text-base"
            />
            {voiceMessage ? (
              <p className="text-xs text-muted-foreground">{voiceMessage}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Type your log, or tap the mic to dictate. Edit the text before analyzing.
              </p>
            )}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>

        <CardFooter className="border-t border-border/60">
          <Button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || isSaving || !rawText.trim()}
            className="w-full sm:w-auto"
          >
            {isAnalyzing ? "Analyzing…" : "Analyze log"}
          </Button>
        </CardFooter>
      </Card>

      {result ? (
        <ParsedLogPreview
          result={result}
          onSave={handleSave}
          isSaving={isSaving}
        />
      ) : null}
    </div>
  );
}
