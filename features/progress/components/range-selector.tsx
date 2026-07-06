"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  PROGRESS_RANGES,
  getRangeLabel,
  type ProgressRange,
} from "@/features/progress/types";
import { cn } from "@/lib/utils";

export function ProgressRangeSelector({ currentRange }: { currentRange: ProgressRange }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setRange(range: ProgressRange) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    router.push(`/progress?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {PROGRESS_RANGES.map((range) => (
        <Button
          key={range}
          type="button"
          size="sm"
          variant={currentRange === range ? "default" : "outline"}
          onClick={() => setRange(range)}
          className={cn("min-w-0")}
        >
          {getRangeLabel(range)}
        </Button>
      ))}
    </div>
  );
}
