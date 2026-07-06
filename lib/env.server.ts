import "server-only";

import { sanitizeSecret } from "@/lib/env";

/**
 * Server-only secrets. Never import this file from Client Components.
 */

export type ServerEnv = {
  SUPABASE_SERVICE_ROLE_KEY: string;
  OPENAI_API_KEY: string;
};

function readServerEnv() {
  return {
    SUPABASE_SERVICE_ROLE_KEY: sanitizeSecret(process.env.SUPABASE_SERVICE_ROLE_KEY),
    OPENAI_API_KEY: sanitizeSecret(process.env.OPENAI_API_KEY),
    ALLOWED_USER_EMAIL: process.env.ALLOWED_USER_EMAIL?.trim().toLowerCase(),
  };
}

export function hasServerEnv(): boolean {
  const env = readServerEnv();
  return Boolean(env.SUPABASE_SERVICE_ROLE_KEY && env.OPENAI_API_KEY);
}

export function hasSupabaseServiceRoleKey(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function hasOpenAIApiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function getServerEnv(): ServerEnv {
  const env = readServerEnv();
  const missing: string[] = [];

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }
  if (!env.OPENAI_API_KEY) {
    missing.push("OPENAI_API_KEY");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing server environment variables: ${missing.join(", ")}. Copy .env.example to .env.local and set your own keys.`
    );
  }

  return {
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY!,
    OPENAI_API_KEY: env.OPENAI_API_KEY!,
  };
}

export function getSupabaseServiceRoleKey(): string {
  const key = sanitizeSecret(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local (server-only — never use NEXT_PUBLIC_)."
    );
  }

  return key;
}

export function getOpenAIApiKey(): string {
  const key = sanitizeSecret(process.env.OPENAI_API_KEY);

  if (!key) {
    throw new Error(
      "Missing OPENAI_API_KEY. Add it to .env.local (server-only — never use NEXT_PUBLIC_)."
    );
  }

  return key;
}
