/**
 * Generates a human-readable citizen tracking ID, e.g. CIVIC-2026-48192
 */
export function generateTrackingId(): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `CIVIC-${year}-${randomDigits}`;
}

export function formatDate(isoString: string): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export function formatTimeRemaining(remainingMs: number): string {
  if (remainingMs <= 0) {
    const overdueMs = Math.abs(remainingMs);
    const hours = Math.floor(overdueMs / (1000 * 60 * 60));
    return `${hours}h overdue`;
  }

  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h left`;
  }
  return `${hours}h ${minutes}m left`;
}
