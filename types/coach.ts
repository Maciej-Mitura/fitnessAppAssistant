import type { DailyLog } from "@/types/daily-log";
import type { MacroTarget } from "@/types/macros";
import type { Profile } from "@/types/profile";

export type CoachExercise = {
  exercise_name: string;
  sets: number | null;
  reps: string | null;
  weight_kg: number | null;
  notes: string | null;
};

export type CoachWorkout = {
  id: string;
  date: string;
  workout_type: string | null;
  raw_text: string;
  ai_summary: string | null;
  pain_notes: string | null;
  fatigue_score: number | null;
  exercises: CoachExercise[];
};

export type CoachBodyMetric = {
  date: string;
  weight_kg: number;
};

export type CoachSpecialEvent = {
  date: string;
  type: string;
  description: string;
};

export type CoachContext = {
  profile: Profile | null;
  macroTarget: MacroTarget | null;
  dailyLogs: DailyLog[];
  bodyMetrics: CoachBodyMetric[];
  workouts: CoachWorkout[];
  specialEvents: CoachSpecialEvent[];
};

export type CoachMessage = {
  role: "user" | "assistant";
  content: string;
};
