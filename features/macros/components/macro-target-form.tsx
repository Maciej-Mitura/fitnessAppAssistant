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
import {
  createMacroTarget,
  type SaveMacroTargetState,
} from "@/features/macros/actions";
import { getLocalTodayISO } from "@/features/macros/utils";
import type { MacroTarget } from "@/types/macros";
import { cn } from "@/lib/utils";

type MacroTargetFormProps = {
  activeTarget?: MacroTarget | null;
  className?: string;
  showCurrentSummary?: boolean;
};

const initialState: SaveMacroTargetState = {
  success: false,
  message: null,
  error: null,
};

export function MacroTargetForm({
  activeTarget,
  className,
  showCurrentSummary = true,
}: MacroTargetFormProps) {
  const [state, formAction, isPending] = useActionState(
    createMacroTarget,
    initialState
  );

  const defaults = {
    calories: activeTarget?.calories ?? "",
    protein_g: activeTarget?.protein_g ?? "",
    carbs_g: activeTarget?.carbs_g ?? "",
    fat_g: activeTarget?.fat_g ?? "",
    active_from: getLocalTodayISO(),
  };

  return (
    <Card className={cn("border-border/60 bg-card/80", className)}>
      <CardHeader>
        <CardTitle>Set macro targets</CardTitle>
        <CardDescription>
          Creating a new target closes the previous one the day before it starts.
        </CardDescription>
      </CardHeader>

      <form
        action={formAction}
        key={activeTarget ? `${activeTarget.active_from}-${activeTarget.calories}` : "new"}
      >
        <CardContent className="space-y-5">
          {showCurrentSummary && activeTarget ? (
            <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-sm">
              <p className="text-muted-foreground">Current active target</p>
              <p className="font-medium">
                {activeTarget.calories.toLocaleString()} kcal · P {activeTarget.protein_g}g ·
                C {activeTarget.carbs_g}g · F {activeTarget.fat_g}g
              </p>
              <p className="text-xs text-muted-foreground">
                Active from {activeTarget.active_from}
              </p>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                name="calories"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                placeholder="2200"
                defaultValue={defaults.calories}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="active_from">Active from</Label>
              <Input
                id="active_from"
                name="active_from"
                type="date"
                defaultValue={defaults.active_from}
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="protein_g">Protein (g)</Label>
              <Input
                id="protein_g"
                name="protein_g"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                placeholder="160"
                defaultValue={defaults.protein_g}
                required
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
                min={1}
                step={1}
                placeholder="220"
                defaultValue={defaults.carbs_g}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="fat_g">Fat (g)</Label>
              <Input
                id="fat_g"
                name="fat_g"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                placeholder="70"
                defaultValue={defaults.fat_g}
                required
                disabled={isPending}
              />
            </div>
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
            {isPending ? "Saving…" : "Save macro targets"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
