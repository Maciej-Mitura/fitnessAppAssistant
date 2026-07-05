export type Profile = {
  id: string;
  user_id: string;
  display_name: string | null;
  height_cm: number | null;
  birth_date: string | null;
  goal: string | null;
  injury_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type LatestBodyWeight = {
  weight_kg: number;
  date: string;
};
