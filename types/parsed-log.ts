export type ParsedExercise = {
  name: string;
  weight_kg: number | null;
  sets: number | null;
  reps: string | null;
  notes: string | null;
};

export type ParsedLog = {
  bodyweight_kg: number | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  workout_detected: boolean;
  workout_type: string | null;
  exercises: ParsedExercise[];
  pain_notes: string | null;
  fatigue_notes: string | null;
  special_events: string[];
  summary: string;
  feedback: string;
};
