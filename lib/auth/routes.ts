export const LOGIN_PATH = "/login";

export const PUBLIC_PATHS = [LOGIN_PATH] as const;

export const PUBLIC_PATH_PREFIXES = ["/auth"] as const;

/** PWA/static assets that must load without a session. No user data is served. */
export const PUBLIC_ASSET_PATHS = [
  "/manifest.json",
  "/sw.js",
  "/offline.html",
  "/icon",
  "/apple-icon",
] as const;

export const PUBLIC_ASSET_PREFIXES = ["/icons/"] as const;

export function isPublicAssetPath(pathname: string): boolean {
  if (PUBLIC_ASSET_PATHS.includes(pathname as (typeof PUBLIC_ASSET_PATHS)[number])) {
    return true;
  }

  return PUBLIC_ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname as (typeof PUBLIC_PATHS)[number])) {
    return true;
  }

  if (isPublicAssetPath(pathname)) {
    return true;
  }

  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
