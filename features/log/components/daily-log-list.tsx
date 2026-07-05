import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMacroSummary, formatWeightKg } from "@/features/log/utils";
import { formatDisplayDate } from "@/lib/date";
import type { DailyLogWithWeight } from "@/types/daily-log";

type DailyLogListProps = {
  logs: DailyLogWithWeight[];
  title?: string;
  description?: string;
  emptyMessage?: string;
};

export function DailyLogList({
  logs,
  title = "Recent daily logs",
  description = "Your latest nutrition and notes entries.",
  emptyMessage = "No daily logs yet. Add your first entry on the Log page.",
}: DailyLogListProps) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const macroSummary = formatMacroSummary(log);

              return (
                <article
                  key={log.id}
                  className="rounded-lg border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium">{formatDisplayDate(log.date)}</p>
                    {log.weight_kg ? (
                      <p className="text-sm text-muted-foreground">
                        {formatWeightKg(log.weight_kg)}
                      </p>
                    ) : null}
                  </div>

                  {macroSummary ? (
                    <p className="mt-2 text-sm text-primary">{macroSummary}</p>
                  ) : null}

                  {log.raw_text && log.raw_text !== "—" ? (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {log.raw_text}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
