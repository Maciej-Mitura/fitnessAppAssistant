import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/features/auth/components/login-form";
import { getAuthPageState } from "@/features/auth/queries";

export const metadata: Metadata = {
  title: "Sign in",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage() {
  const { registrationOpen } = await getAuthPageState();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <LoginForm registrationOpen={registrationOpen} />
      </Suspense>
    </div>
  );
}
