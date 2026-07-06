import Link from "next/link";
import { Dumbbell, MessageSquareQuote, Scale } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type {
  LatestAiFeedback,
  LatestWorkoutSummary,
} from "@/features/dashboard/queries";
import { formatWeightKg } from "@/features/log/utils";
import { formatDisplayDate } from "@/lib/date";
import type { LatestBodyWeight } from "@/types/profile";

type DashboardInsightCardsProps = {
  latestWeight: LatestBodyWeight | null;
  latestFeedback: LatestAiFeedback | null;
  latestWorkout: LatestWorkoutSummary | null;
};

export function DashboardInsightCards({
  latestWeight,
  latestFeedback,
  latestWorkout,
}: DashboardInsightCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="border-border/60 bg-card/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">Bodyweight</CardTitle>
            <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Scale className="size-4" />
            </span>
          </div>
          <CardDescription>Latest recorded weight</CardDescription>
        </CardHeader>
        <CardContent>
          {latestWeight ? (
            <div className="space-y-1">
              <p className="text-3xl font-semibold tracking-tight">
                {formatWeightKg(latestWeight.weight_kg)}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDisplayDate(latestWeight.date)}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                No bodyweight logged yet. Add your weight on the Log page.
              </p>
              <Link href="/log" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Log weight
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80 md:col-span-1 lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">AI feedback</CardTitle>
            <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <MessageSquareQuote className="size-4" />
            </span>
          </div>
          <CardDescription>Latest coaching note from your daily log</CardDescription>
        </CardHeader>
        <CardContent>
          {latestFeedback ? (
            <div className="space-y-2">
              <p className="line-clamp-4 text-sm leading-relaxed text-primary">
                {latestFeedback.feedback}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDisplayDate(latestFeedback.date)}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                No AI feedback yet. Use natural language logging to get coaching notes.
              </p>
              <Link href="/log" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Log with AI
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80 md:col-span-2 lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">Latest workout</CardTitle>
            <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Dumbbell className="size-4" />
            </span>
          </div>
          <CardDescription>Most recent training session summary</CardDescription>
        </CardHeader>
        <CardContent>
          {latestWorkout ? (
            <div className="space-y-2">
              {latestWorkout.workout_type ? (
                <Badge variant="secondary" className="capitalize">
                  {latestWorkout.workout_type}
                </Badge>
              ) : null}
              <p className="line-clamp-4 text-sm leading-relaxed">
                {latestWorkout.summary}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDisplayDate(latestWorkout.date)}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                No workout logged yet. Describe your training in a natural language log.
              </p>
              <Link href="/log" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Log workout
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
