export const LOGIN_PATH = "/login";

export const PUBLIC_PATHS = [LOGIN_PATH] as const;

export const PUBLIC_PATH_PREFIXES = ["/auth"] as const;

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname as (typeof PUBLIC_PATHS)[number])) {
    return true;
  }

  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
