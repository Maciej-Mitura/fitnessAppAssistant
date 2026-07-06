import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AccountSection } from "@/features/settings/components/account-section";
import { DangerZone } from "@/features/settings/components/danger-zone";
import { DataExportButton } from "@/features/settings/components/data-export-button";
import { EnvironmentSection } from "@/features/settings/components/environment-section";
import { MacroTargetPanel } from "@/features/macros/components/macro-target-panel";
import type { EnvironmentStatus } from "@/features/settings/types";
import type { MacroTarget } from "@/types/macros";

type SettingsSectionsProps = {
  email: string | null;
  userId: string | null;
  createdAt: string | null;
  activeMacroTarget: MacroTarget | null;
  environmentStatus: EnvironmentStatus;
};

export function SettingsSections({
  email,
  userId,
  createdAt,
  activeMacroTarget,
  environmentStatus,
}: SettingsSectionsProps) {
  return (
    <div className="space-y-4">
      <AccountSection email={email} userId={userId} createdAt={createdAt} />
      <EnvironmentSection status={environmentStatus} />
      <MacroTargetPanel activeTarget={activeMacroTarget} />

      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>Data export</CardTitle>
          <CardDescription>Download a copy of your FitOS data.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataExportButton />
        </CardContent>
      </Card>

      <DangerZone />
    </div>
  );
}
