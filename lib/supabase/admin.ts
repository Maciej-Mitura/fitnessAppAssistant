import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getPublicSupabaseEnv } from "@/lib/env";
import { getSupabaseServiceRoleKey } from "@/lib/env.server";

/**
 * Supabase client with service-role privileges. Server-only.
 * Use for admin tasks that bypass RLS — never call from the browser.
 */
export function createAdminClient() {
  const { url } = getPublicSupabaseEnv();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
