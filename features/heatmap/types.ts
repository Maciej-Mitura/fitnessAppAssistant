export const BODY_PARTS = [
  "chest",
  "back",
  "shoulders",
  "arms",
  "legs",
  "core",
  "cardio_combat",
] as const;

export type BodyPart = (typeof BODY_PARTS)[number];

export type BodyPartMapping = {
  part: BodyPart;
  weight: number;
};

export type ExerciseBodyPartRule = {
  keywords: string[];
  parts: BodyPartMapping[];
  /** Short label shown in explainability UI */
  reason: string;
};

export const BODY_PART_LABELS: Record<BodyPart, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  arms: "Arms",
  legs: "Legs",
  core: "Core",
  cardio_combat: "Cardio / combat",
};

export type HeatmapExerciseRow = {
  exercise_name: string;
  sets: number | null;
  date: string;
};

export type MappedExerciseContribution = {
  exerciseName: string;
  date: string;
  setVolume: number;
  parts: BodyPartMapping[];
  reason: string;
};

export type BodyPartScore = {
  part: BodyPart;
  label: string;
  score: number;
  weeklyVolume: number;
  intensity: number;
};

export type HeatmapData = {
  rangeDays: number | "all";
  bodyPartScores: BodyPartScore[];
  totalMappedSets: number;
  unmappedExercises: number;
  mappedContributions: MappedExerciseContribution[];
  weeksInRange: number;
};
