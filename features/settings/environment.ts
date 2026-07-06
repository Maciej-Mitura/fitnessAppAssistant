import "server-only";

import { hasClientEnv, getPublicSupabaseEnv } from "@/lib/env";
import { hasOpenAIApiKey, hasSupabaseServiceRoleKey } from "@/lib/env.server";
import type { EnvironmentStatus } from "@/features/settings/types";

export function getEnvironmentStatus(): EnvironmentStatus {
  let supabaseHost: string | null = null;
  const supabaseConfigured = hasClientEnv();

  if (supabaseConfigured) {
    try {
      const { url } = getPublicSupabaseEnv();
      supabaseHost = new URL(url).host;
    } catch {
      supabaseHost = null;
    }
  }

  const openaiConfigured = hasOpenAIApiKey();

  return {
    environment: process.env.NODE_ENV ?? "development",
    supabaseConfigured,
    supabaseHost,
    openaiConfigured,
    serviceRoleConfigured: hasSupabaseServiceRoleKey(),
    aiProviderLabel: openaiConfigured ? "OpenAI · gpt-4o-mini" : "Not configured",
  };
}
