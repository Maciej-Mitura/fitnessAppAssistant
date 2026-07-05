import {
  Activity,
  Bot,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Settings,
  TrendingUp,
  User,
} from "lucide-react";

import type { NavItem } from "@/types";

export const mainNavItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Your daily fitness overview",
    showInBottomNav: true,
    showInSidebar: true,
  },
  {
    href: "/log",
    label: "Log",
    icon: ClipboardList,
    description: "Record workouts, meals, and habits",
    showInBottomNav: true,
    showInSidebar: true,
  },
  {
    href: "/progress",
    label: "Progress",
    icon: TrendingUp,
    description: "Track trends and milestones",
    showInBottomNav: true,
    showInSidebar: true,
  },
  {
    href: "/coach",
    label: "Coach",
    icon: Bot,
    description: "AI coaching and guidance",
    showInBottomNav: true,
    showInSidebar: true,
  },
  {
    href: "/plans",
    label: "Plans",
    icon: CalendarDays,
    description: "Training and nutrition plans",
    showInBottomNav: true,
    showInSidebar: true,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    description: "Your fitness profile",
    showInBottomNav: false,
    showInSidebar: true,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    description: "App preferences and account",
    showInBottomNav: false,
    showInSidebar: true,
  },
];

export const bottomNavItems = mainNavItems.filter((item) => item.showInBottomNav);
export const sidebarNavItems = mainNavItems.filter((item) => item.showInSidebar);

export const appBrand = {
  name: "FitOS",
  tagline: "Your private fitness assistant",
  icon: Activity,
};
