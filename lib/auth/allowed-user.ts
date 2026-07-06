export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getAllowedUserEmail(): string | null {
  const email = process.env.ALLOWED_USER_EMAIL?.trim();

  if (!email) {
    return null;
  }

  return normalizeEmail(email);
}

export function isAllowedUserEmail(email: string | undefined | null): boolean {
  const allowed = getAllowedUserEmail();

  if (!allowed || !email) {
    return false;
  }

  return normalizeEmail(email) === allowed;
}
