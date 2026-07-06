export type TrainingPlan = {
  id: string;
  user_id: string;
  name: string;
  goal: string | null;
  is_active: boolean;
  created_at: string;
};

export type PlannedExercise = {
  id: string;
  planned_workout_id: string;
  user_id: string;
  exercise_name: string;
  sets: number | null;
  reps: string | null;
  weight_kg: number | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
};

export type PlannedWorkout = {
  id: string;
  plan_id: string;
  user_id: string;
  name: string;
  sort_order: number;
  notes: string | null;
  created_at: string;
  exercises: PlannedExercise[];
};

export type TrainingPlanWithWorkouts = TrainingPlan & {
  workouts: PlannedWorkout[];
};
