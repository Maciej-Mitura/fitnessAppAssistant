import { mapExerciseToBodyParts } from "@/features/heatmap/body-part-mapper";
import {
  BODY_PARTS,
  BODY_PART_LABELS,
  type BodyPart,
  type HeatmapData,
  type HeatmapExerciseRow,
} from "@/features/heatmap/types";
import type { ProgressRange } from "@/features/progress/types";
import { getRangeStartDate, getWeekStartISO } from "@/features/progress/utils";

function initPartRecord(): Record<BodyPart, number> {
  return {
    chest: 0,
    back: 0,
    shoulders: 0,
    arms: 0,
    legs: 0,
    core: 0,
    cardio_combat: 0,
  };
}

function getSetVolume(sets: number | null): number {
  return sets && sets > 0 ? sets : 1;
}

function countWeeksInRange(
  exercises: HeatmapExerciseRow[],
  range: ProgressRange
): number {
  const start = getRangeStartDate(range);
  const weeks = new Set<string>();

  for (const exercise of exercises) {
    if (start && exercise.date < start) {
      continue;
    }
    weeks.add(getWeekStartISO(exercise.date));
  }

  if (weeks.size > 0) {
    return weeks.size;
  }

  if (range === "all") {
    return 1;
  }

  return Math.max(1, Math.ceil(Number(range) / 7));
}

function getRangeDays(range: ProgressRange): number | "all" {
  return range === "all" ? "all" : Number(range);
}

export function buildHeatmapData(
  exercises: HeatmapExerciseRow[],
  range: ProgressRange
): HeatmapData {
  const start = getRangeStartDate(range);
  const filtered = start
    ? exercises.filter((exercise) => exercise.date >= start)
    : exercises;

  const partTotals = initPartRecord();
  const mappedContributions: HeatmapData["mappedContributions"] = [];
  let totalMappedSets = 0;
  let unmappedExercises = 0;

  for (const exercise of filtered) {
    const match = mapExerciseToBodyParts(exercise.exercise_name);
    const setVolume = getSetVolume(exercise.sets);

    if (!match) {
      unmappedExercises += 1;
      continue;
    }

    totalMappedSets += setVolume;
    mappedContributions.push({
      exerciseName: exercise.exercise_name,
      date: exercise.date,
      setVolume,
      parts: match.parts,
      reason: `${match.reason} (matched "${match.matchedKeyword}")`,
    });

    for (const { part, weight } of match.parts) {
      partTotals[part] += setVolume * weight;
    }
  }

  const maxScore = Math.max(...BODY_PARTS.map((part) => partTotals[part]), 1);
  const weeksInRange = countWeeksInRange(filtered, range);

  const bodyPartScores = BODY_PARTS.map((part) => {
    const score = Math.round(partTotals[part] * 10) / 10;
    const weeklyVolume = Math.round((partTotals[part] / weeksInRange) * 10) / 10;

    return {
      part,
      label: BODY_PART_LABELS[part],
      score,
      weeklyVolume,
      intensity: Math.round((partTotals[part] / maxScore) * 100),
    };
  }).sort((a, b) => b.score - a.score);

  return {
    rangeDays: getRangeDays(range),
    bodyPartScores,
    totalMappedSets,
    unmappedExercises,
    mappedContributions,
    weeksInRange,
  };
}
