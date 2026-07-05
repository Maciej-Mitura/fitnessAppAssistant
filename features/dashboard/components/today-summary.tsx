import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatMacroSummary, formatWeightKg } from "@/features/log/utils";
import type { DailyLog } from "@/types/daily-log";
import type { MacroTotals } from "@/types/macros";

type TodaySummaryProps = {
  todayWeight: number | null;
  loggedMacros: MacroTotals | null;
  todayLogs: DailyLog[];
};

export function TodaySummary({
  todayWeight,
  loggedMacros,
  todayLogs,
}: TodaySummaryProps) {
  const hasData =
    todayWeight !== null ||
    loggedMacros !== null ||
    todayLogs.some((log) => log.raw_text && log.raw_text !== "—");

  const latestNote = todayLogs.find((log) => log.raw_text && log.raw_text !== "—");

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle>Today</CardTitle>
          <CardDescription>Bodyweight, nutrition, and notes logged today.</CardDescription>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/log" />}>
          Add log
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasData ? (
          <p className="text-sm text-muted-foreground">
            Nothing logged yet today. Head to Log to record weight, macros, or notes.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Weight</p>
                <p className="mt-1 font-semibold">
                  {todayWeight !== null ? formatWeightKg(todayWeight) : "—"}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Calories</p>
                <p className="mt-1 font-semibold">
                  {loggedMacros?.calories ? loggedMacros.calories.toLocaleString() : "—"}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Protein</p>
                <p className="mt-1 font-semibold">
                  {loggedMacros?.protein_g ? `${loggedMacros.protein_g}g` : "—"}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Entries</p>
                <p className="mt-1 font-semibold">{todayLogs.length}</p>
              </div>
            </div>

            {loggedMacros ? (
              <p className="text-sm text-muted-foreground">
                {formatMacroSummary({
                  calories: loggedMacros.calories,
                  protein_g: loggedMacros.protein_g,
                  carbs_g: loggedMacros.carbs_g,
                  fat_g: loggedMacros.fat_g,
                })}
              </p>
            ) : null}

            {latestNote ? (
              <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Latest note</p>
                <p className="mt-1 line-clamp-2 text-sm">{latestNote.raw_text}</p>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
