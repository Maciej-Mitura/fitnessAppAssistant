import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { buildMacroProgress } from "@/features/macros/utils";
import type { MacroTarget, MacroTotals } from "@/types/macros";
import { cn } from "@/lib/utils";

type DashboardMacroCardProps = {
  activeTarget: MacroTarget | null;
  loggedMacros: MacroTotals | null;
  hasLogToday: boolean;
};

function MacroBar({
  label,
  current,
  target,
  unit,
  percent,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  percent: number;
}) {
  const currentLabel =
    unit === "" ? current.toLocaleString() : `${current.toLocaleString()}${unit}`;
  const targetLabel =
    unit === "" ? target.toLocaleString() : `${target.toLocaleString()}${unit}`;

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
      <div className="flex items-end justify-between gap-2">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-right text-lg font-semibold tracking-tight">
          {currentLabel}
          <span className="text-sm font-normal text-muted-foreground">
            {" "}
            / {targetLabel}
          </span>
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full bg-primary transition-all",
            percent >= 100 && "bg-primary/80"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{percent}% of target</p>
    </div>
  );
}

export function DashboardMacroCard({
  activeTarget,
  loggedMacros,
  hasLogToday,
}: DashboardMacroCardProps) {
  if (!activeTarget) {
    return (
      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>Today&apos;s macros</CardTitle>
          <CardDescription>Track calories and macros against your daily targets.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No macro target set yet. Add your daily targets to start tracking progress.
          </p>
          <Link href="/settings" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Set macro targets
          </Link>
        </CardContent>
      </Card>
    );
  }

  const progress = buildMacroProgress(activeTarget, loggedMacros);

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle>Today&apos;s macros</CardTitle>
        <CardDescription>
          {hasLogToday
            ? "Logged totals compared to your active targets."
            : "No log today yet — numbers will update once you log food."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {progress.map((item) => (
            <MacroBar
              key={item.key}
              label={item.label}
              current={item.current}
              target={item.target}
              unit={item.unit}
              percent={item.percent}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
