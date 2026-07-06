import "server-only";

import {
  average,
  calcAdherencePercent,
  formatChartDate,
  formatWeekLabel,
  getMacroTargetForDate,
  getRangeStartDate,
  getWeekStartISO,
} from "@/features/progress/utils";
import type { ProgressRange } from "@/features/progress/types";
import { requireUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

export type ProgressSummary = {
  avgCalories: number | null;
  avgProtein: number | null;
  weightChange: number | null;
  workoutsCompleted: number;
};

export type ProgressChartData = {
  bodyweight: Array<{ date: string; label: string; weight: number }>;
  calories: Array<{ date: string; label: string; calories: number }>;
  protein: Array<{ date: string; label: string; protein: number }>;
  adherence: Array<{ date: string; label: string; adherence: number }>;
  workoutFrequency: Array<{ week: string; label: string; count: number }>;
  summary: ProgressSummary;
};


export async function getProgressData(
  range: ProgressRange
): Promise<ProgressChartData> {
  const user = await requireUser();
  const supabase = await createClient();
  const start = getRangeStartDate(range);

  let bodyMetricsQuery = supabase
    .from("body_metrics")
    .select("date, weight_kg, created_at")
    .eq("user_id", user.id)
    .not("weight_kg", "is", null)
    .order("date", { ascending: true });

  let dailyLogsQuery = supabase
    .from("daily_logs")
    .select("date, calories, protein_g, carbs_g, fat_g")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  let workoutLogsQuery = supabase
    .from("workout_logs")
    .select("date")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  const macroTargetsQuery = supabase
    .from("macro_targets")
    .select("*")
    .eq("user_id", user.id)
    .order("active_from", { ascending: true });

  if (start) {
    bodyMetricsQuery = bodyMetricsQuery.gte("date", start);
    dailyLogsQuery = dailyLogsQuery.gte("date", start);
    workoutLogsQuery = workoutLogsQuery.gte("date", start);
  }

  const [
    { data: bodyMetrics, error: bodyError },
    { data: dailyLogs, error: dailyError },
    { data: workoutLogs, error: workoutError },
    { data: macroTargets, error: macroError },
  ] = await Promise.all([
    bodyMetricsQuery,
    dailyLogsQuery,
    workoutLogsQuery,
    macroTargetsQuery,
  ]);

  if (bodyError) throw new Error(bodyError.message);
  if (dailyError) throw new Error(dailyError.message);
  if (workoutError) throw new Error(workoutError.message);
  if (macroError) throw new Error(macroError.message);

  const weightByDate = new Map<string, number>();

  for (const row of bodyMetrics ?? []) {
    if (row.weight_kg !== null) {
      weightByDate.set(row.date, Number(row.weight_kg));
    }
  }

  const bodyweight = [...weightByDate.entries()]
    .map(([date, weight]) => ({
      date,
      label: formatChartDate(date),
      weight,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const dailyTotals = new Map<
    string,
    { calories: number; protein_g: number; carbs_g: number; fat_g: number }
  >();

  for (const row of dailyLogs ?? []) {
    const existing = dailyTotals.get(row.date) ?? {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
    };

    dailyTotals.set(row.date, {
      calories: existing.calories + (row.calories ?? 0),
      protein_g: existing.protein_g + (row.protein_g ?? 0),
      carbs_g: existing.carbs_g + (row.carbs_g ?? 0),
      fat_g: existing.fat_g + (row.fat_g ?? 0),
    });
  }

  const calories = [...dailyTotals.entries()]
    .filter(([, totals]) => totals.calories > 0)
    .map(([date, totals]) => ({
      date,
      label: formatChartDate(date),
      calories: totals.calories,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const protein = [...dailyTotals.entries()]
    .filter(([, totals]) => totals.protein_g > 0)
    .map(([date, totals]) => ({
      date,
      label: formatChartDate(date),
      protein: totals.protein_g,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const adherence = [...dailyTotals.entries()]
    .map(([date, totals]) => {
      const target = getMacroTargetForDate(macroTargets ?? [], date);

      if (!target) {
        return null;
      }

      const hasLoggedMacros =
        totals.calories > 0 ||
        totals.protein_g > 0 ||
        totals.carbs_g > 0 ||
        totals.fat_g > 0;

      if (!hasLoggedMacros) {
        return null;
      }

      return {
        date,
        label: formatChartDate(date),
        adherence: calcAdherencePercent(totals, target),
      };
    })
    .filter((row): row is { date: string; label: string; adherence: number } => row !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  const workoutsByWeek = new Map<string, number>();

  for (const row of workoutLogs ?? []) {
    const week = getWeekStartISO(row.date);
    workoutsByWeek.set(week, (workoutsByWeek.get(week) ?? 0) + 1);
  }

  const workoutFrequency = [...workoutsByWeek.entries()]
    .map(([week, count]) => ({
      week,
      label: formatWeekLabel(week),
      count,
    }))
    .sort((a, b) => a.week.localeCompare(b.week));

  const calorieValues = calories.map((row) => row.calories);
  const proteinValues = protein.map((row) => row.protein);

  let weightChange: number | null = null;

  if (bodyweight.length >= 2) {
    const first = bodyweight[0].weight;
    const last = bodyweight[bodyweight.length - 1].weight;
    weightChange = Math.round((last - first) * 10) / 10;
  }

  return {
    bodyweight,
    calories,
    protein,
    adherence,
    workoutFrequency,
    summary: {
      avgCalories: average(calorieValues),
      avgProtein: average(proteinValues),
      weightChange,
      workoutsCompleted: workoutLogs?.length ?? 0,
    },
  };
}
