import { PageHeader } from "@/components/layout/page-header";
import { getUser } from "@/lib/auth/get-user";
import { getActiveMacroTarget } from "@/features/macros/queries";
import { SettingsSections } from "@/features/settings/components/settings-sections";

export default async function SettingsPage() {
  const user = await getUser();
  const activeMacroTarget = await getActiveMacroTarget();

  return (
    <>
      <PageHeader
        title="Settings"
        description="Control how FitOS works for you."
        showProfileLink={false}
      />
      <SettingsSections email={user?.email} activeMacroTarget={activeMacroTarget} />
    </>
  );
}
