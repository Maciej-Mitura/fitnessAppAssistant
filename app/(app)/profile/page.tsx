import { PageHeader } from "@/components/layout/page-header";
import { MacroTargetPanel } from "@/features/macros/components/macro-target-panel";
import { getActiveMacroTarget } from "@/features/macros/queries";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { getLatestBodyWeight, getProfile } from "@/features/profile/queries";
import { requireUser } from "@/lib/auth/get-user";

export default async function ProfilePage() {
  const user = await requireUser();
  const [profile, latestWeight, activeMacroTarget] = await Promise.all([
    getProfile(),
    getLatestBodyWeight(),
    getActiveMacroTarget(),
  ]);

  return (
    <>
      <PageHeader
        title="Profile"
        description="Your goals, metrics, and account overview."
        showProfileLink={false}
      />
      <div className="space-y-6">
        <ProfileForm
          email={user.email ?? ""}
          profile={profile}
          latestWeight={latestWeight}
        />
        <MacroTargetPanel activeTarget={activeMacroTarget} />
      </div>
    </>
  );
}
