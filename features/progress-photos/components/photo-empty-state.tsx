import { Camera } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PhotoEmptyState() {
  return (
    <Card className="border-dashed border-border/80 bg-card/50">
      <CardHeader className="items-center text-center">
        <span className="mb-2 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Camera className="size-5" />
        </span>
        <CardTitle className="text-base">No progress photos yet</CardTitle>
        <CardDescription>
          Upload front, side, and back photos over time to visualize your transformation.
          Photos stay private and are only visible to you.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
