"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard, chartTheme } from "@/features/progress/components/chart-card";
import { SummaryCard } from "@/features/progress/components/summary-card";
import type { ProgressChartData } from "@/features/progress/queries";
import type { ProgressRange } from "@/features/progress/types";
import { getRangeLabel } from "@/features/progress/types";
import {
  Dumbbell,
  Flame,
  Scale,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

type ProgressChartsProps = {
  data: ProgressChartData;
  range: ProgressRange;
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border/60 bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">
        {payload[0].name}: {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export function ProgressCharts({ data, range }: ProgressChartsProps) {
  const rangeLabel = getRangeLabel(range).toLowerCase();

  const weightChangeValue =
    data.summary.weightChange === null
      ? "—"
      : `${data.summary.weightChange > 0 ? "+" : ""}${data.summary.weightChange} kg`;

  const weightChangeHint =
    data.summary.weightChange === null
      ? "Need 2+ weigh-ins"
      : data.summary.weightChange > 0
        ? "Increase"
        : data.summary.weightChange < 0
          ? "Decrease"
          : "No change";

  const WeightIcon =
    data.summary.weightChange !== null && data.summary.weightChange < 0
      ? TrendingDown
      : TrendingUp;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          label="Avg calories"
          value={
            data.summary.avgCalories !== null
              ? data.summary.avgCalories.toLocaleString()
              : "—"
          }
          hint={`Per logged day · ${rangeLabel}`}
          icon={Flame}
        />
        <SummaryCard
          label="Avg protein"
          value={
            data.summary.avgProtein !== null ? `${data.summary.avgProtein}g` : "—"
          }
          hint={`Per logged day · ${rangeLabel}`}
          icon={Target}
        />
        <SummaryCard
          label="Weight change"
          value={weightChangeValue}
          hint={weightChangeHint}
          icon={data.summary.weightChange === null ? Scale : WeightIcon}
        />
        <SummaryCard
          label="Workouts"
          value={String(data.summary.workoutsCompleted)}
          hint={`Completed · ${rangeLabel}`}
          icon={Dumbbell}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Bodyweight trend"
          description="Weight over time from body metrics."
          isEmpty={data.bodyweight.length === 0}
          emptyMessage="No bodyweight data yet. Log your weight to see trends."
          className="lg:col-span-2"
        >
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.bodyweight} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={chartTheme.grid.stroke} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={chartTheme.axis}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={chartTheme.axis}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  domain={["auto", "auto"]}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Weight (kg)"
                  stroke={chartTheme.primary}
                  strokeWidth={2}
                  dot={{ r: 3, fill: chartTheme.primary }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Calories per day"
          description="Daily calorie totals from logs."
          isEmpty={data.calories.length === 0}
          emptyMessage="No calorie data yet. Log meals to track daily intake."
        >
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.calories} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={chartTheme.grid.stroke} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={chartTheme.axis}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis tick={chartTheme.axis} tickLine={false} axisLine={false} width={40} />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="calories"
                  name="Calories"
                  fill={chartTheme.primary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Protein per day"
          description="Daily protein totals from logs."
          isEmpty={data.protein.length === 0}
          emptyMessage="No protein data yet. Log nutrition to see daily protein."
        >
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.protein} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={chartTheme.grid.stroke} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={chartTheme.axis}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis tick={chartTheme.axis} tickLine={false} axisLine={false} width={40} />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="protein"
                  name="Protein (g)"
                  fill={chartTheme.primary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Macro adherence"
          description="Average % of calories, protein, carbs, and fat targets met."
          isEmpty={data.adherence.length === 0}
          emptyMessage="No adherence data yet. Set macro targets and log daily nutrition."
        >
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.adherence} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={chartTheme.grid.stroke} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={chartTheme.axis}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={chartTheme.axis}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  domain={[0, 100]}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="adherence"
                  name="Adherence %"
                  stroke={chartTheme.primary}
                  strokeWidth={2}
                  dot={{ r: 3, fill: chartTheme.primary }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Workout frequency"
          description="Training sessions per week."
          isEmpty={data.workoutFrequency.length === 0}
          emptyMessage="No workouts logged yet. Log training sessions to see weekly frequency."
        >
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.workoutFrequency}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid stroke={chartTheme.grid.stroke} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={chartTheme.axis}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={chartTheme.axis}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="count"
                  name="Workouts"
                  fill={chartTheme.primary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
