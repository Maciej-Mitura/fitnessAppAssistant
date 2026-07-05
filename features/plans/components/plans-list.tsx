import { PlaceholderCard } from "@/components/placeholder-card";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    title: "Push / Pull / Legs",
    type: "Training",
    status: "Active",
  },
  {
    title: "Lean bulk nutrition",
    type: "Nutrition",
    status: "Draft",
  },
  {
    title: "10k steps habit",
    type: "Habit",
    status: "Paused",
  },
];

export function PlansList() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <PlaceholderCard
          key={plan.title}
          title={plan.title}
          description={`${plan.type} plan`}
        >
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
            {plan.status}
          </Badge>
        </PlaceholderCard>
      ))}

      <PlaceholderCard
        title="Create a plan"
        description="Build a training block, meal template, or habit stack."
        className="border-dashed"
      >
        <p className="text-sm text-muted-foreground">
          Plan builder coming in a future release.
        </p>
      </PlaceholderCard>
    </div>
  );
}
