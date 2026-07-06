import type { BodyPartMapping, ExerciseBodyPartRule } from "@/features/heatmap/types";

/**
 * Ordered rules are not used for priority — the longest matching keyword wins.
 * Weights are explainable multipliers (1 = primary mover, 0.5 = secondary).
 */
export const EXERCISE_BODY_PART_RULES: ExerciseBodyPartRule[] = [
  {
    keywords: [
      "mma",
      "bjj",
      "jiu jitsu",
      "jiujitsu",
      "kickbox",
      "kickboxing",
      "muay thai",
      "boxing",
      "sparring",
      "wrestling",
      "combat",
      "grappling",
    ],
    parts: [{ part: "cardio_combat", weight: 1 }],
    reason: "Combat sport keyword",
  },
  {
    keywords: [
      "bench press",
      "bench",
      "chest press",
      "incline press",
      "decline press",
      "chest fly",
      "pec deck",
      "pec fly",
      "flye",
      "push up",
      "pushup",
      "dip",
    ],
    parts: [
      { part: "chest", weight: 1 },
      { part: "arms", weight: 0.5 },
      { part: "shoulders", weight: 0.5 },
    ],
    reason: "Chest press / push pattern",
  },
  {
    keywords: [
      "barbell row",
      "bent over row",
      "cable row",
      "seated row",
      "t-bar row",
      "chest supported row",
      "row",
    ],
    parts: [
      { part: "back", weight: 1 },
      { part: "arms", weight: 0.5 },
    ],
    reason: "Row / horizontal pull",
  },
  {
    keywords: [
      "pull up",
      "pullup",
      "chin up",
      "chinup",
      "lat pulldown",
      "pulldown",
      "pull-down",
    ],
    parts: [
      { part: "back", weight: 1 },
      { part: "arms", weight: 0.5 },
    ],
    reason: "Vertical pull",
  },
  {
    keywords: ["deadlift", "rdl", "romanian deadlift", "good morning", "hip hinge"],
    parts: [
      { part: "legs", weight: 1 },
      { part: "back", weight: 0.5 },
    ],
    reason: "Hinge / posterior chain",
  },
  {
    keywords: [
      "squat",
      "leg press",
      "lunge",
      "split squat",
      "step up",
      "hack squat",
      "leg extension",
      "leg curl",
      "calf raise",
      "calf",
      "hip thrust",
      "glute bridge",
    ],
    parts: [{ part: "legs", weight: 1 }],
    reason: "Squat / leg pattern",
  },
  {
    keywords: [
      "overhead press",
      "ohp",
      "military press",
      "shoulder press",
      "lateral raise",
      "front raise",
      "rear delt",
      "arnold press",
      "upright row",
      "face pull",
    ],
    parts: [
      { part: "shoulders", weight: 1 },
      { part: "arms", weight: 0.3 },
    ],
    reason: "Shoulder press / raise",
  },
  {
    keywords: ["bicep curl", "hammer curl", "preacher curl", "concentration curl", "curl"],
    parts: [{ part: "arms", weight: 1 }],
    reason: "Curl pattern",
  },
  {
    keywords: [
      "tricep",
      "skull crusher",
      "pushdown",
      "rope pushdown",
      "overhead extension",
      "kickback",
    ],
    parts: [{ part: "arms", weight: 1 }],
    reason: "Tricep isolation",
  },
  {
    keywords: [
      "plank",
      "crunch",
      "sit up",
      "situp",
      "ab wheel",
      "leg raise",
      "hanging knee",
      "pallof",
      "woodchop",
      "russian twist",
      "dead bug",
      "cable crunch",
      "hollow hold",
      "side plank",
    ],
    parts: [{ part: "core", weight: 1 }],
    reason: "Core / anti-extension",
  },
  {
    keywords: [
      "run",
      "running",
      "treadmill",
      "bike",
      "cycling",
      "cycle",
      "swim",
      "rowing machine",
      "erg",
      "elliptical",
      "jump rope",
      "burpee",
      "hiit",
      "sprint",
      "cardio",
      "walk",
      "stair",
    ],
    parts: [{ part: "cardio_combat", weight: 1 }],
    reason: "Cardio keyword",
  },
  {
    keywords: ["pullover", "back extension", "hyperextension", "reverse fly"],
    parts: [{ part: "back", weight: 1 }],
    reason: "Back isolation / extension",
  },
];

export type BodyPartMatch = {
  parts: BodyPartMapping[];
  reason: string;
  matchedKeyword: string;
};

export function mapExerciseToBodyParts(exerciseName: string): BodyPartMatch | null {
  const normalized = exerciseName.toLowerCase().trim().replace(/\s+/g, " ");

  let best: BodyPartMatch | null = null;

  for (const rule of EXERCISE_BODY_PART_RULES) {
    for (const keyword of rule.keywords) {
      if (!normalized.includes(keyword)) {
        continue;
      }

      if (!best || keyword.length > best.matchedKeyword.length) {
        best = {
          parts: rule.parts,
          reason: rule.reason,
          matchedKeyword: keyword,
        };
      }
    }
  }

  return best;
}
