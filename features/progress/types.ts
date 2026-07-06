export type ProgressRange = "7" | "14" | "30" | "all";

export const PROGRESS_RANGES: ProgressRange[] = ["7", "14", "30", "all"];

export function parseProgressRange(value?: string): ProgressRange {
  if (value === "7" || value === "14" || value === "30" || value === "all") {
    return value;
  }

  return "14";
}

export function getRangeLabel(range: ProgressRange) {
  switch (range) {
    case "7":
      return "7 days";
    case "14":
      return "14 days";
    case "30":
      return "30 days";
    case "all":
      return "All time";
  }
}
