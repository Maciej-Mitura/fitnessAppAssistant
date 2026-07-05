import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/get-user";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  return <AppShell>{children}</AppShell>;
}
