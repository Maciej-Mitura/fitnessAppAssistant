import "server-only";

import { requireUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { getLocalTodayISO } from "@/lib/date";
import type { MacroTarget, MacroTotals } from "@/types/macros";

export async function getActiveMacroTarget(): Promise<MacroTarget | null> {
  const user = await requireUser();
  const supabase = await createClient();
  const today = getLocalTodayISO();

  const { data, error } = await supabase
    .from("macro_targets")
    .select("*")
    .eq("user_id", user.id)
    .lte("active_from", today)
    .or(`active_until.is.null,active_until.gte.${today}`)
    .order("active_from", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getTodayLoggedMacros(): Promise<MacroTotals | null> {
  const user = await requireUser();
  const supabase = await createClient();
  const today = getLocalTodayISO();

  const { data, error } = await supabase
    .from("daily_logs")
    .select("calories, protein_g, carbs_g, fat_g")
    .eq("user_id", user.id)
    .eq("date", today);

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.length) {
    return null;
  }

  const totals = data.reduce<MacroTotals>(
    (acc, row) => ({
      calories: acc.calories + (row.calories ?? 0),
      protein_g: acc.protein_g + (row.protein_g ?? 0),
      carbs_g: acc.carbs_g + (row.carbs_g ?? 0),
      fat_g: acc.fat_g + (row.fat_g ?? 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  const hasAny =
    totals.calories > 0 ||
    totals.protein_g > 0 ||
    totals.carbs_g > 0 ||
    totals.fat_g > 0;

  return hasAny ? totals : null;
}
