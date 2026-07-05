import type { DailyLog } from "@/types/daily-log";

export function formatMacroSummary(log: Pick<
  DailyLog,
  "calories" | "protein_g" | "carbs_g" | "fat_g"
>) {
  const parts: string[] = [];

  if (log.calories) {
    parts.push(`${log.calories.toLocaleString()} kcal`);
  }
  if (log.protein_g) {
    parts.push(`P ${log.protein_g}g`);
  }
  if (log.carbs_g) {
    parts.push(`C ${log.carbs_g}g`);
  }
  if (log.fat_g) {
    parts.push(`F ${log.fat_g}g`);
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

export function formatWeightKg(weightKg: number) {
  return `${weightKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`;
}
