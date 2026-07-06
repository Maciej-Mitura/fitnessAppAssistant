/**
 * Client-safe environment variables.
 *
 * Only `NEXT_PUBLIC_*` variables belong here. Safe to import in Client
 * Components, but prefer reading env in server code when possible.
 */

export type ClientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
};

/** Strip whitespace — hosting dashboards often wrap long JWT keys across lines. */
export function sanitizeSecret(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return value.replace(/\s/g, "");
}

export function sanitizeUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return value.trim().replace(/[\r\n]+/g, "");
}

function readClientEnv() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: sanitizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: sanitizeSecret(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
  };
}

export function hasClientEnv(): boolean {
  const env = readClientEnv();
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getClientEnv(): ClientEnv {
  const env = readClientEnv();

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing client environment variables. Copy .env.example to .env.local and set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

/** Supabase URL + anon key for browser and SSR user-scoped clients. */
export function getPublicSupabaseEnv() {
  const env = getClientEnv();

  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}
