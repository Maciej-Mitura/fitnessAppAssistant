import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppLogo } from "@/components/app-logo";

type PageHeaderProps = {
  title: string;
  description?: string;
  showProfileLink?: boolean;
};

export function PageHeader({
  title,
  description,
  showProfileLink = true,
}: PageHeaderProps) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4 md:mb-8">
      <div className="space-y-1 md:hidden">
        <AppLogo />
      </div>

      <div className="flex-1 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {showProfileLink ? (
        <Link
          href="/profile"
          className="shrink-0 md:hidden"
          aria-label="Open profile"
        >
          <Avatar className="size-9 ring-1 ring-border">
            <AvatarFallback className="bg-muted text-xs font-medium">YO</AvatarFallback>
          </Avatar>
        </Link>
      ) : null}
    </header>
  );
}
