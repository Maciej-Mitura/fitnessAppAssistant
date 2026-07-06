import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ParsedLog } from "@/types/parsed-log";

function formatNullableNumber(value: number | null, suffix = "") {
  if (value === null) {
    return "—";
  }

  return `${value.toLocaleString()}${suffix}`;
}

type ParsedLogPreviewProps = {
  result: ParsedLog;
  onSave?: () => void;
  isSaving?: boolean;
};

export function ParsedLogPreview({
  result,
  onSave,
  isSaving = false,
}: ParsedLogPreviewProps) {
  return (
    <Card className="border-primary/20 bg-card/90">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Parsed result</CardTitle>
            <CardDescription>Review the extracted data, then save when ready.</CardDescription>
          </div>
          {result.workout_detected ? (
            <Badge variant="secondary" className="shrink-0">
              Workout
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Summary
          </p>
          <p className="text-sm">{result.summary}</p>
        </div>

        <Separator className="opacity-50" />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <PreviewStat label="Weight" value={formatNullableNumber(result.bodyweight_kg, " kg")} />
          <PreviewStat label="Calories" value={formatNullableNumber(result.calories)} />
          <PreviewStat label="Protein" value={formatNullableNumber(result.protein_g, "g")} />
          <PreviewStat label="Carbs" value={formatNullableNumber(result.carbs_g, "g")} />
          <PreviewStat label="Fat" value={formatNullableNumber(result.fat_g, "g")} />
        </div>

        {result.workout_detected ? (
          <>
            <Separator className="opacity-50" />
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Workout
              </p>
              {result.workout_type ? (
                <p className="text-sm">
                  Type: <span className="font-medium capitalize">{result.workout_type}</span>
                </p>
              ) : null}

              {result.exercises.length > 0 ? (
                <div className="space-y-2">
                  {result.exercises.map((exercise) => (
                    <div
                      key={`${exercise.name}-${exercise.reps}-${exercise.weight_kg}`}
                      className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-sm"
                    >
                      <p className="font-medium capitalize">{exercise.name}</p>
                      <p className="mt-1 text-muted-foreground">
                        {[
                          exercise.sets ? `${exercise.sets} sets` : null,
                          exercise.reps ? `${exercise.reps} reps` : null,
                          exercise.weight_kg ? `${exercise.weight_kg} kg` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "No set details"}
                      </p>
                      {exercise.notes ? (
                        <p className="mt-1 text-xs text-muted-foreground">{exercise.notes}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No exercises extracted.</p>
              )}
            </div>
          </>
        ) : null}

        {result.pain_notes || result.fatigue_notes ? (
          <>
            <Separator className="opacity-50" />
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Notes
              </p>
              {result.pain_notes ? (
                <p className="text-sm">
                  <span className="text-muted-foreground">Pain: </span>
                  {result.pain_notes}
                </p>
              ) : null}
              {result.fatigue_notes ? (
                <p className="text-sm">
                  <span className="text-muted-foreground">Fatigue: </span>
                  {result.fatigue_notes}
                </p>
              ) : null}
            </div>
          </>
        ) : null}

        {result.special_events.length > 0 ? (
          <>
            <Separator className="opacity-50" />
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Special events
              </p>
              <div className="flex flex-wrap gap-2">
                {result.special_events.map((event) => (
                  <Badge key={event} variant="outline">
                    {event}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        ) : null}

        <Separator className="opacity-50" />

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            AI feedback
          </p>
          <p className="text-sm text-primary">{result.feedback}</p>
        </div>
      </CardContent>

      {onSave ? (
        <CardFooter className="border-t border-border/60">
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? "Saving…" : "Save log"}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
