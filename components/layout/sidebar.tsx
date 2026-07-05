"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { AppLogo } from "@/components/app-logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { appBrand, sidebarNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border/60 bg-sidebar md:flex">
      <div className="flex h-16 items-center px-5">
        <AppLogo />
      </div>

      <Separator className="opacity-60" />

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {sidebarNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" strokeWidth={isActive ? 2.25 : 2} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="space-y-3 border-t border-border/60 p-4">
        <LogoutButton variant="ghost" className="hidden md:block" />
        <p className="text-xs text-muted-foreground">{appBrand.tagline}</p>
      </div>
    </aside>
  );
}
