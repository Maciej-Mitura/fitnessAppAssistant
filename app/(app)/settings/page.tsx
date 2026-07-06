import { PageHeader } from "@/components/layout/page-header";
import { getActiveMacroTarget } from "@/features/macros/queries";
import { SettingsSections } from "@/features/settings/components/settings-sections";
import { getEnvironmentStatus } from "@/features/settings/environment";
import { getUser } from "@/lib/auth/get-user";

export default async function SettingsPage() {
  const user = await getUser();
  const activeMacroTarget = await getActiveMacroTarget();
  const environmentStatus = getEnvironmentStatus();

  return (
    <>
      <PageHeader
        title="Settings"
        description="Control how FitOS works for you."
        showProfileLink={false}
      />
      <SettingsSections
        email={user?.email ?? null}
        userId={user?.id ?? null}
        createdAt={user?.created_at ?? null}
        activeMacroTarget={activeMacroTarget}
        environmentStatus={environmentStatus}
      />
    </>
  );
}
