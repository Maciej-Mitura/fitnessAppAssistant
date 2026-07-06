import { LogoutButton } from "@/components/logout-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type AccountSectionProps = {
  email: string | null;
  userId: string | null;
  createdAt: string | null;
};

function formatAccountDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AccountSection({ email, userId, createdAt }: AccountSectionProps) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Your sign-in details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Email</span>
            <span className="truncate font-medium">{email ?? "—"}</span>
          </div>
          <Separator className="opacity-50" />
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">User ID</span>
            <span className="truncate font-mono text-xs">{userId ?? "—"}</span>
          </div>
          <Separator className="opacity-50" />
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium">{formatAccountDate(createdAt)}</span>
          </div>
        </div>
        <LogoutButton />
      </CardContent>
    </Card>
  );
}
