export type DailyLog = {
  id: string;
  user_id: string;
  date: string;
  raw_text: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  ai_summary: string | null;
  ai_feedback: string | null;
  created_at: string;
};

export type DailyLogWithWeight = DailyLog & {
  weight_kg: number | null;
};
