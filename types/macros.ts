export type MacroTarget = {
  id: string;
  user_id: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  active_from: string;
  active_until: string | null;
  created_at: string;
};

export type MacroTotals = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type MacroProgressItem = {
  key: keyof MacroTotals;
  label: string;
  unit: string;
  current: number;
  target: number;
  percent: number;
};
