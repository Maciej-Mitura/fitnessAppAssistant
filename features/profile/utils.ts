export function formatWeightKg(weightKg: number) {
  return `${weightKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`;
}

export function formatProfileDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getProfileInitials(displayName?: string | null, email?: string | null) {
  if (displayName?.trim()) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  }

  if (email) {
    const local = email.split("@")[0] ?? "";
    return local.slice(0, 2).toUpperCase() || "YO";
  }

  return "YO";
}

export function toDateInputValue(date: string | null | undefined) {
  return date ?? "";
}

export function toNumberInputValue(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}
