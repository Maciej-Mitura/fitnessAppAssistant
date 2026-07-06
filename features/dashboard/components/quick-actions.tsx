import Link from "next/link";
import {
  Bot,
  ClipboardList,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const actions = [
  {
    href: "/log",
    label: "Log today",
    icon: ClipboardList,
    variant: "default" as const,
  },
  {
    href: "/coach",
    label: "Ask coach",
    icon: Bot,
    variant: "outline" as const,
  },
  {
    href: "/progress",
    label: "View progress",
    icon: TrendingUp,
    variant: "outline" as const,
  },
  {
    href: "/settings",
    label: "Edit targets",
    icon: SlidersHorizontal,
    variant: "outline" as const,
  },
];

export function DashboardQuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              buttonVariants({ variant: action.variant, size: "lg" }),
              "h-auto flex-col gap-2 py-4"
            )}
          >
            <Icon className="size-4" />
            <span>{action.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
