import type { MacroProgressItem, MacroTarget, MacroTotals } from "@/types/macros";
import { getLocalTodayISO } from "@/lib/date";

export { getLocalTodayISO };

export function subtractDaysISO(dateISO: string, days: number) {
  const date = new Date(`${dateISO}T00:00:00`);
  date.setDate(date.getDate() - days);
  return date.toLocaleDateString("en-CA");
}

export function formatMacroValue(value: number, unit: string) {
  return `${value.toLocaleString()}${unit}`;
}

export function calcMacroPercent(current: number, target: number) {
  if (target <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((current / target) * 100));
}

export function buildMacroProgress(
  target: MacroTarget,
  logged: MacroTotals | null
): MacroProgressItem[] {
  const current: MacroTotals = logged ?? {
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
  };

  const items: Array<{
    key: keyof MacroTotals;
    label: string;
    unit: string;
  }> = [
    { key: "calories", label: "Calories", unit: "" },
    { key: "protein_g", label: "Protein", unit: "g" },
    { key: "carbs_g", label: "Carbs", unit: "g" },
    { key: "fat_g", label: "Fat", unit: "g" },
  ];

  return items.map((item) => ({
    key: item.key,
    label: item.label,
    unit: item.unit,
    current: current[item.key],
    target: target[item.key],
    percent: calcMacroPercent(current[item.key], target[item.key]),
  }));
}

export function formatMacroTargetSummary(target: MacroTarget) {
  return `${target.calories.toLocaleString()} kcal · P ${target.protein_g}g · C ${target.carbs_g}g · F ${target.fat_g}g`;
}
