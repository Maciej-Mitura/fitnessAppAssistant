import type { BodyPartScore } from "@/features/heatmap/types";
import { cn } from "@/lib/utils";

type BodyDiagramProps = {
  scores: BodyPartScore[];
};

const REGION_STYLES: Record<
  string,
  { className: string; label: string; x: string; y: string; w: string; h: string }
> = {
  shoulders: {
    className: "data-[slot=shoulders]",
    label: "Shoulders",
    x: "28",
    y: "18",
    w: "44",
    h: "12",
  },
  chest: {
    className: "data-[slot=chest]",
    label: "Chest",
    x: "32",
    y: "32",
    w: "36",
    h: "14",
  },
  arms: {
    className: "data-[slot=arms]",
    label: "Arms",
    x: "18",
    y: "30",
    w: "12",
    h: "36",
  },
  armsRight: {
    className: "data-[slot=arms]",
    label: "Arms",
    x: "70",
    y: "30",
    w: "12",
    h: "36",
  },
  core: {
    className: "data-[slot=core]",
    label: "Core",
    x: "34",
    y: "48",
    w: "32",
    h: "14",
  },
  legs: {
    className: "data-[slot=legs]",
    label: "Legs",
    x: "30",
    y: "64",
    w: "40",
    h: "30",
  },
};

function intensityToFill(intensity: number) {
  if (intensity >= 75) return "rgba(16, 185, 129, 0.85)";
  if (intensity >= 50) return "rgba(16, 185, 129, 0.55)";
  if (intensity >= 25) return "rgba(16, 185, 129, 0.3)";
  if (intensity > 0) return "rgba(16, 185, 129, 0.15)";
  return "rgba(148, 163, 184, 0.12)";
}

function getIntensity(scores: BodyPartScore[], part: string) {
  return scores.find((score) => score.part === part)?.intensity ?? 0;
}

export function BodyDiagram({ scores }: BodyDiagramProps) {
  const shoulders = getIntensity(scores, "shoulders");
  const chest = getIntensity(scores, "chest");
  const arms = getIntensity(scores, "arms");
  const core = getIntensity(scores, "core");
  const legs = getIntensity(scores, "legs");
  const back = getIntensity(scores, "back");
  const cardio = getIntensity(scores, "cardio_combat");

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        viewBox="0 0 100 100"
        className="h-44 w-36 text-muted-foreground sm:h-52 sm:w-40"
        aria-label="Body-part training intensity diagram"
      >
        <ellipse cx="50" cy="10" rx="10" ry="11" fill="rgba(148,163,184,0.2)" />

        <rect
          x={REGION_STYLES.shoulders.x}
          y={REGION_STYLES.shoulders.y}
          width={REGION_STYLES.shoulders.w}
          height={REGION_STYLES.shoulders.h}
          rx="4"
          fill={intensityToFill(shoulders)}
          stroke="currentColor"
          strokeOpacity="0.2"
        />
        <rect
          x={REGION_STYLES.chest.x}
          y={REGION_STYLES.chest.y}
          width={REGION_STYLES.chest.w}
          height={REGION_STYLES.chest.h}
          rx="4"
          fill={intensityToFill(chest)}
          stroke="currentColor"
          strokeOpacity="0.2"
        />
        <rect
          x={REGION_STYLES.arms.x}
          y={REGION_STYLES.arms.y}
          width={REGION_STYLES.arms.w}
          height={REGION_STYLES.arms.h}
          rx="4"
          fill={intensityToFill(arms)}
          stroke="currentColor"
          strokeOpacity="0.2"
        />
        <rect
          x={REGION_STYLES.armsRight.x}
          y={REGION_STYLES.armsRight.y}
          width={REGION_STYLES.armsRight.w}
          height={REGION_STYLES.armsRight.h}
          rx="4"
          fill={intensityToFill(arms)}
          stroke="currentColor"
          strokeOpacity="0.2"
        />
        <rect
          x={REGION_STYLES.core.x}
          y={REGION_STYLES.core.y}
          width={REGION_STYLES.core.w}
          height={REGION_STYLES.core.h}
          rx="4"
          fill={intensityToFill(core)}
          stroke="currentColor"
          strokeOpacity="0.2"
        />
        <rect
          x={REGION_STYLES.legs.x}
          y={REGION_STYLES.legs.y}
          width={REGION_STYLES.legs.w}
          height={REGION_STYLES.legs.h}
          rx="5"
          fill={intensityToFill(legs)}
          stroke="currentColor"
          strokeOpacity="0.2"
        />

        <rect
          x="8"
          y="78"
          width="10"
          height="18"
          rx="3"
          fill={intensityToFill(back)}
          stroke="currentColor"
          strokeOpacity="0.15"
        />
        <text x="10" y="92" fontSize="4" fill="currentColor" opacity="0.5">
          back
        </text>
      </svg>

      <div className="flex flex-wrap justify-center gap-2 text-[10px] text-muted-foreground">
        <LegendDot label="Back" intensity={back} />
        <LegendDot label="Cardio" intensity={cardio} />
      </div>
    </div>
  );
}

function LegendDot({ label, intensity }: { label: string; intensity: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2 py-0.5">
      <span
        className={cn("size-2 rounded-full")}
        style={{ backgroundColor: intensityToFill(intensity) }}
      />
      {label}
      <span className="tabular-nums">{intensity}%</span>
    </span>
  );
}
