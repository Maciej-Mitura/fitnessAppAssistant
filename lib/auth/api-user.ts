import "server-only";

import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { isAllowedUserEmail } from "@/lib/auth/allowed-user";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

export async function requireAllowedApiUser(): Promise<
  { user: User } | { response: NextResponse }
> {
  const user = await getUser();

  if (!user) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!isAllowedUserEmail(user.email)) {
    const supabase = await createClient();
    await supabase.auth.signOut();

    return {
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user };
}
