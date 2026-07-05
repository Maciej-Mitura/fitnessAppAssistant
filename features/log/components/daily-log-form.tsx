"use client";

import { useActionState } from "react";

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
import { saveDailyLog, type SaveDailyLogState } from "@/features/log/actions";
import { getLocalTodayISO } from "@/lib/date";

const initialState: SaveDailyLogState = {
  success: false,
  message: null,
  error: null,
};

export function DailyLogForm() {
  const [state, formAction, isPending] = useActionState(saveDailyLog, initialState);

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle>Daily log</CardTitle>
        <CardDescription>
          Record bodyweight, nutrition, and notes for any day.
        </CardDescription>
      </CardHeader>

      <form action={formAction}>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={getLocalTodayISO()}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight_kg">Bodyweight (kg)</Label>
              <Input
                id="weight_kg"
                name="weight_kg"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                placeholder="82.5"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                name="calories"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                placeholder="2200"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="protein_g">Protein (g)</Label>
              <Input
                id="protein_g"
                name="protein_g"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                placeholder="160"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carbs_g">Carbs (g)</Label>
              <Input
                id="carbs_g"
                name="carbs_g"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                placeholder="220"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fat_g">Fat (g)</Label>
              <Input
                id="fat_g"
                name="fat_g"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                placeholder="70"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="raw_text">Notes</Label>
            <Textarea
              id="raw_text"
              name="raw_text"
              placeholder="Meals, energy, sleep, training notes…"
              rows={4}
              disabled={isPending}
            />
          </div>

          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
          {state.success && state.message ? (
            <p className="text-sm text-primary">{state.message}</p>
          ) : null}
        </CardContent>

        <CardFooter className="border-t border-border/60">
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? "Saving…" : "Save daily log"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
