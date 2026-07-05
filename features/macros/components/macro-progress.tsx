import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildMacroProgress } from "@/features/macros/utils";
import type { MacroTarget, MacroTotals } from "@/types/macros";
import { cn } from "@/lib/utils";

type MacroProgressProps = {
  target: MacroTarget | null;
  logged: MacroTotals | null;
  className?: string;
};

function MacroProgressBar({
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
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {currentLabel}
          <span className="text-foreground/40"> / </span>
          {targetLabel}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full bg-primary transition-all",
            percent >= 100 && "bg-primary/80"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{percent}% of target</p>
    </div>
  );
}

export function MacroProgress({ target, logged, className }: MacroProgressProps) {
  if (!target) {
    return (
      <Card className={cn("border-border/60 bg-card/80", className)}>
        <CardHeader>
          <CardTitle>Today&apos;s macros</CardTitle>
          <CardDescription>
            Set your macro targets to track daily nutrition progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No active macro target yet. Add one below to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  const progress = buildMacroProgress(target, logged);

  return (
    <Card className={cn("border-border/60 bg-card/80", className)}>
      <CardHeader>
        <CardTitle>Today&apos;s macros</CardTitle>
        <CardDescription>
          {logged
            ? "Progress toward your active daily targets."
            : "No macros logged today yet — totals will appear here once you log food."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {progress.map((item) => (
          <MacroProgressBar
            key={item.key}
            label={item.label}
            current={item.current}
            target={item.target}
            unit={item.unit}
            percent={item.percent}
          />
        ))}
      </CardContent>
    </Card>
  );
}
