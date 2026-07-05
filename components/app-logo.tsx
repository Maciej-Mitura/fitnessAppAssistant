import Link from "next/link";

import { cn } from "@/lib/utils";
import { appBrand } from "@/lib/navigation";

export function AppLogo({ className }: { className?: string }) {
  const Icon = appBrand.icon;

  return (
    <Link href="/dashboard" className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
        <Icon className="size-4" strokeWidth={2.25} />
      </span>
      <div className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-tight">{appBrand.name}</span>
        <span className="text-[10px] text-muted-foreground">Private assistant</span>
      </div>
    </Link>
  );
}
