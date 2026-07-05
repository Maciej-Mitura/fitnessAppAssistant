import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PlaceholderCardProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
  badge?: string;
};

export function PlaceholderCard({
  title,
  description,
  children,
  className,
  badge,
}: PlaceholderCardProps) {
  return (
    <Card className={cn("border-border/60 bg-card/80 backdrop-blur-sm", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {badge ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
              {badge}
            </span>
          ) : null}
        </div>
      </CardHeader>
      {children ? <CardContent>{children}</CardContent> : null}
    </Card>
  );
}
