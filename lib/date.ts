export function getLocalTodayISO() {
  return new Date().toLocaleDateString("en-CA");
}

export function formatDisplayDate(dateISO: string) {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getDaysAgoISO(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - (days - 1));
  return date.toLocaleDateString("en-CA");
}
