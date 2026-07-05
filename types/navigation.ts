import type { LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
  showInBottomNav?: boolean;
  showInSidebar?: boolean;
};
