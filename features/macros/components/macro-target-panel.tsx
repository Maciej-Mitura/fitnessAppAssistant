import { MacroTargetForm } from "@/features/macros/components/macro-target-form";
import type { MacroTarget } from "@/types/macros";

type MacroTargetPanelProps = {
  activeTarget: MacroTarget | null;
};

export function MacroTargetPanel({ activeTarget }: MacroTargetPanelProps) {
  return <MacroTargetForm activeTarget={activeTarget} />;
}
