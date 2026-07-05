import "server-only";

import { requireUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { getLocalTodayISO } from "@/lib/date";
import type { DailyLog, DailyLogWithWeight } from "@/types/daily-log";

export async function getRecentDailyLogs(
  limit = 14
): Promise<DailyLogWithWeight[]> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: logs, error } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  if (!logs?.length) {
    return [];
  }

  const dates = [...new Set(logs.map((log) => log.date))];

  const { data: metrics, error: metricsError } = await supabase
    .from("body_metrics")
    .select("date, weight_kg, created_at")
    .eq("user_id", user.id)
    .in("date", dates)
    .not("weight_kg", "is", null)
    .order("created_at", { ascending: false });

  if (metricsError) {
    throw new Error(metricsError.message);
  }

  const weightByDate = new Map<string, number>();

  for (const metric of metrics ?? []) {
    if (!weightByDate.has(metric.date) && metric.weight_kg !== null) {
      weightByDate.set(metric.date, Number(metric.weight_kg));
    }
  }

  return logs.map((log) => ({
    ...log,
    weight_kg: weightByDate.get(log.date) ?? null,
  }));
}

export async function getTodayBodyWeight(): Promise<number | null> {
  const user = await requireUser();
  const supabase = await createClient();
  const today = getLocalTodayISO();

  const { data, error } = await supabase
    .from("body_metrics")
    .select("weight_kg")
    .eq("user_id", user.id)
    .eq("date", today)
    .not("weight_kg", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.weight_kg ? Number(data.weight_kg) : null;
}

export async function getTodayDailyLogs(): Promise<DailyLog[]> {
  const user = await requireUser();
  const supabase = await createClient();
  const today = getLocalTodayISO();

  const { data, error } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
