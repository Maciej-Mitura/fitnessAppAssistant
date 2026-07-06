import { getLocalTodayISO } from "@/lib/date";
import type { ProgressRange } from "@/features/progress/types";
import type { MacroTarget } from "@/types/macros";

export function getRangeStartDate(range: ProgressRange): string | null {
  if (range === "all") {
    return null;
  }

  const days = Number(range);
  const date = new Date();
  date.setDate(date.getDate() - (days - 1));

  return date.toLocaleDateString("en-CA");
}

export function formatChartDate(dateISO: string) {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatWeekLabel(weekStartISO: string) {
  return new Date(`${weekStartISO}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function getWeekStartISO(dateISO: string) {
  const date = new Date(`${dateISO}T00:00:00`);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toLocaleDateString("en-CA");
}

export function isDateInRange(dateISO: string, range: ProgressRange) {
  const start = getRangeStartDate(range);

  if (!start) {
    return true;
  }

  const today = getLocalTodayISO();
  return dateISO >= start && dateISO <= today;
}

export function getMacroTargetForDate(
  targets: MacroTarget[],
  dateISO: string
): MacroTarget | null {
  const matching = targets.filter(
    (target) =>
      target.active_from <= dateISO &&
      (!target.active_until || target.active_until >= dateISO)
  );

  if (matching.length === 0) {
    return null;
  }

  return matching.sort((a, b) => b.active_from.localeCompare(a.active_from))[0];
}

export function calcAdherencePercent(
  logged: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  },
  target: MacroTarget
) {
  const percents = [
    target.calories > 0 ? Math.min(100, (logged.calories / target.calories) * 100) : 0,
    target.protein_g > 0 ? Math.min(100, (logged.protein_g / target.protein_g) * 100) : 0,
    target.carbs_g > 0 ? Math.min(100, (logged.carbs_g / target.carbs_g) * 100) : 0,
    target.fat_g > 0 ? Math.min(100, (logged.fat_g / target.fat_g) * 100) : 0,
  ];

  return Math.round(percents.reduce((sum, value) => sum + value, 0) / percents.length);
}

export function average(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
