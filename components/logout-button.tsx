import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";

type LogoutButtonProps = {
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  showIcon?: boolean;
};

export function LogoutButton({
  className,
  variant = "outline",
  showIcon = true,
}: LogoutButtonProps) {
  return (
    <form action={signOut} className={className}>
      <Button type="submit" variant={variant} className="w-full">
        {showIcon ? <LogOut className="size-4" /> : null}
        Sign out
      </Button>
    </form>
  );
}
