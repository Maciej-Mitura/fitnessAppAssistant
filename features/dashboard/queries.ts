import "server-only";

import { requireUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { getActiveMacroTarget, getTodayLoggedMacros } from "@/features/macros/queries";
import { getTodayDailyLogs } from "@/features/log/queries";
import { getLatestBodyWeight } from "@/features/profile/queries";
import type { LatestBodyWeight } from "@/types/profile";
import type { MacroTarget, MacroTotals } from "@/types/macros";
import type { DailyLog } from "@/types/daily-log";

export type LatestAiFeedback = {
  feedback: string;
  date: string;
};

export type LatestWorkoutSummary = {
  summary: string;
  workout_type: string | null;
  date: string;
};

export type DashboardData = {
  activeTarget: MacroTarget | null;
  loggedMacros: MacroTotals | null;
  hasLogToday: boolean;
  todayLogs: DailyLog[];
  latestWeight: LatestBodyWeight | null;
  latestFeedback: LatestAiFeedback | null;
  latestWorkout: LatestWorkoutSummary | null;
};

export async function getLatestAiFeedback(): Promise<LatestAiFeedback | null> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("daily_logs")
    .select("ai_feedback, date")
    .eq("user_id", user.id)
    .not("ai_feedback", "is", null)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.ai_feedback) {
    return null;
  }

  return {
    feedback: data.ai_feedback,
    date: data.date,
  };
}

export async function getLatestWorkoutSummary(): Promise<LatestWorkoutSummary | null> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workout_logs")
    .select("ai_summary, workout_type, date")
    .eq("user_id", user.id)
    .not("ai_summary", "is", null)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.ai_summary) {
    return null;
  }

  return {
    summary: data.ai_summary,
    workout_type: data.workout_type,
    date: data.date,
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const [
    activeTarget,
    loggedMacros,
    todayLogs,
    latestWeight,
    latestFeedback,
    latestWorkout,
  ] = await Promise.all([
    getActiveMacroTarget(),
    getTodayLoggedMacros(),
    getTodayDailyLogs(),
    getLatestBodyWeight(),
    getLatestAiFeedback(),
    getLatestWorkoutSummary(),
  ]);

  const hasLogToday = todayLogs.length > 0;

  return {
    activeTarget,
    loggedMacros,
    hasLogToday,
    todayLogs,
    latestWeight,
    latestFeedback,
    latestWorkout,
  };
}
