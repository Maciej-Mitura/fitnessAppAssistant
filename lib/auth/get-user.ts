import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { LOGIN_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser(): Promise<User> {
  const user = await getUser();

  if (!user) {
    redirect(LOGIN_PATH);
  }

  return user;
}
