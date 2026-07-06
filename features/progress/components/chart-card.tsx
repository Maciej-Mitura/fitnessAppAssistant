import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChartCardProps = {
  title: string;
  description: string;
  isEmpty?: boolean;
  emptyMessage: string;
  children: React.ReactNode;
  className?: string;
};

export function ChartCard({
  title,
  description,
  isEmpty = false,
  emptyMessage,
  children,
  className,
}: ChartCardProps) {
  return (
    <Card className={cn("border-border/60 bg-card/80", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex h-52 items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

const CHART_COLORS = {
  primary: "oklch(0.76 0.16 155)",
  muted: "oklch(0.68 0.02 260)",
  grid: "oklch(1 0 0 / 8%)",
};

export const chartTheme = {
  axis: { fill: CHART_COLORS.muted, fontSize: 11 },
  grid: { stroke: CHART_COLORS.grid },
  primary: CHART_COLORS.primary,
};
