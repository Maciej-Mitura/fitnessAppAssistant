import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { isAllowedUserEmail } from "@/lib/auth/allowed-user";
import { LOGIN_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

async function rejectUnauthorizedUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`${LOGIN_PATH}?error=unauthorized`);
}

export async function requireUser(): Promise<User> {
  const user = await getUser();

  if (!user) {
    redirect(LOGIN_PATH);
  }

  if (!isAllowedUserEmail(user.email)) {
    await rejectUnauthorizedUser();
  }

  return user;
}
