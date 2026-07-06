"use server";

import { revalidatePath } from "next/cache";

import {
  getAllowedUserEmail,
  isAllowedUserEmail,
  normalizeEmail,
} from "@/lib/auth/allowed-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AuthActionResult = {
  success: boolean;
  error: string | null;
};

export async function signInAllowedUser(
  email: string,
  password: string
): Promise<AuthActionResult> {
  const normalizedEmail = normalizeEmail(email);

  if (!getAllowedUserEmail()) {
    return {
      success: false,
      error: "ALLOWED_USER_EMAIL is not configured on the server.",
    };
  }

  if (!isAllowedUserEmail(normalizedEmail)) {
    return {
      success: false,
      error: "Access is restricted to the app owner.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, error: null };
}

export async function registerAllowedUser(
  email: string,
  password: string
): Promise<AuthActionResult> {
  const normalizedEmail = normalizeEmail(email);
  const allowedEmail = getAllowedUserEmail();

  if (!allowedEmail) {
    return {
      success: false,
      error: "ALLOWED_USER_EMAIL is not configured on the server.",
    };
  }

  if (normalizedEmail !== allowedEmail) {
    return {
      success: false,
      error: "Registration is only available for the configured owner email.",
    };
  }

  let admin;

  try {
    admin = createAdminClient();
  } catch {
    return {
      success: false,
      error: "Registration requires SUPABASE_SERVICE_ROLE_KEY on the server.",
    };
  }

  const { data: existingUsers, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1,
  });

  if (listError) {
    return { success: false, error: listError.message };
  }

  if ((existingUsers.users?.length ?? 0) > 0) {
    return {
      success: false,
      error: "An account already exists. Sign in instead.",
    };
  }

  const { error } = await admin.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (signInError) {
    return {
      success: true,
      error: "Account created. Sign in with your password.",
    };
  }

  revalidatePath("/", "layout");
  return { success: true, error: null };
}
