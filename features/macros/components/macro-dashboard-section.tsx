"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MacroProgress } from "@/features/macros/components/macro-progress";
import { MacroTargetForm } from "@/features/macros/components/macro-target-form";
import type { MacroTarget, MacroTotals } from "@/types/macros";
import { cn } from "@/lib/utils";

type MacroDashboardSectionProps = {
  activeTarget: MacroTarget | null;
  logged: MacroTotals | null;
};

export function MacroDashboardSection({
  activeTarget,
  logged,
}: MacroDashboardSectionProps) {
  const [showForm, setShowForm] = useState(!activeTarget);

  return (
    <div className="space-y-4">
      <MacroProgress target={activeTarget} logged={logged} />

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowForm((open) => !open)}
        >
          {showForm ? "Hide target form" : "Update macro targets"}
          <ChevronDown
            className={cn("size-4 transition-transform", showForm && "rotate-180")}
          />
        </Button>
      </div>

      {showForm ? (
        <MacroTargetForm activeTarget={activeTarget} showCurrentSummary={Boolean(activeTarget)} />
      ) : null}
    </div>
  );
}
