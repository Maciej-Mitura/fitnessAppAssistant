import { PlaceholderCard } from "@/components/placeholder-card";
import { LogoutButton } from "@/components/logout-button";
import { Separator } from "@/components/ui/separator";
import { MacroTargetPanel } from "@/features/macros/components/macro-target-panel";
import type { MacroTarget } from "@/types/macros";

type SettingsSectionsProps = {
  email?: string | null;
  activeMacroTarget?: MacroTarget | null;
};

const settingsSections = [
  {
    title: "App",
    items: ["Units", "Notifications", "Data export"],
  },
  {
    title: "Privacy",
    items: ["Local-first mode", "Delete account"],
  },
];

export function SettingsSections({
  email,
  activeMacroTarget = null,
}: SettingsSectionsProps) {
  return (
    <div className="space-y-4">
      <PlaceholderCard title="Account" description="Your sign-in details.">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="truncate font-medium">{email ?? "—"}</span>
          </div>
          <Separator className="opacity-50" />
          <LogoutButton />
        </div>
      </PlaceholderCard>

      <MacroTargetPanel activeTarget={activeMacroTarget} />

      {settingsSections.map((section) => (
        <PlaceholderCard
          key={section.title}
          title={section.title}
          description="Configuration options will be wired up later."
        >
          <div className="space-y-3">
            {section.items.map((item, index) => (
              <div key={item}>
                <div className="flex items-center justify-between py-1 text-sm">
                  <span>{item}</span>
                  <span className="text-xs text-muted-foreground">Soon</span>
                </div>
                {index < section.items.length - 1 ? (
                  <Separator className="opacity-50" />
                ) : null}
              </div>
            ))}
          </div>
        </PlaceholderCard>
      ))}
    </div>
  );
}
