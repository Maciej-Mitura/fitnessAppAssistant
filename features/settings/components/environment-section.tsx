import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { EnvironmentStatus } from "@/features/settings/types";

type EnvironmentSectionProps = {
  status: EnvironmentStatus;
};

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <Badge variant={ok ? "secondary" : "outline"} className="text-[10px] uppercase">
      {label}
    </Badge>
  );
}

export function EnvironmentSection({ status }: EnvironmentSectionProps) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle>Environment</CardTitle>
        <CardDescription>
          Configuration status for this deployment. Secrets are never shown.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Runtime</span>
          <span className="font-medium capitalize">{status.environment}</span>
        </div>
        <Separator className="opacity-50" />
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Supabase</span>
          <div className="flex items-center gap-2">
            {status.supabaseHost ? (
              <span className="truncate text-xs text-muted-foreground">
                {status.supabaseHost}
              </span>
            ) : null}
            <StatusBadge
              ok={status.supabaseConfigured}
              label={status.supabaseConfigured ? "Connected" : "Missing"}
            />
          </div>
        </div>
        <Separator className="opacity-50" />
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">AI provider</span>
          <span className="font-medium">{status.aiProviderLabel}</span>
        </div>
        <Separator className="opacity-50" />
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Service role key</span>
          <StatusBadge
            ok={status.serviceRoleConfigured}
            label={status.serviceRoleConfigured ? "Set" : "Not set"}
          />
        </div>
      </CardContent>
    </Card>
  );
}
