import { PlaceholderCard } from "@/components/placeholder-card";
import { Button } from "@/components/ui/button";

const samplePrompts = [
  "How should I adjust training this week?",
  "Review my last workout",
  "Suggest a recovery day plan",
];

export function CoachPanel() {
  return (
    <div className="space-y-6">
      <PlaceholderCard
        title="AI Coach"
        description="Personalized guidance based on your goals, logs, and progress."
        badge="Not connected"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
            Coach responses will appear here once AI is connected to your data.
          </div>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((prompt) => (
              <Button key={prompt} variant="secondary" size="sm" disabled>
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      </PlaceholderCard>

      <PlaceholderCard
        title="Weekly check-in"
        description="Structured reflection prompts to keep your plan aligned."
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Energy levels this week?</p>
          <p>Any pain or mobility concerns?</p>
          <p>What felt like a win?</p>
        </div>
      </PlaceholderCard>
    </div>
  );
}
