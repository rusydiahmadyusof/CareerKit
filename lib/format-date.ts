/**
 * Shared date formatting for dashboard, lists, and application rows.
 */

/** Relative time (e.g. "5 minutes ago", "2 days ago") or short date if older */
export function formatTimeAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return diffMins <= 1 ? "1 minute ago" : `${diffMins} minutes ago`;
  if (diffHours < 24) return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/** Short date only (e.g. "Mar 15, 2025") */
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Applied date + relative (e.g. "Mar 10 · 5 days ago") for application row */
export function formatAppliedDateAndDays(iso: string | null, fallbackIso: string): string {
  const source = iso ?? fallbackIso;
  if (!source) return "—";
  const d = new Date(source);
  if (Number.isNaN(d.getTime())) return "—";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  const shortDate = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const relative =
    diffDays === 0
      ? "Today (0 days)"
      : diffDays === 1
        ? "1 day ago"
        : diffDays < 7
          ? `${diffDays} days ago`
          : diffDays < 14
            ? "1 week ago"
            : diffDays < 30
              ? `${Math.floor(diffDays / 7)} weeks ago`
              : `${shortDate} · ${diffDays} days ago`;
  if (diffDays === 0) return `${shortDate} · Today (0 days)`;
  if (diffDays === 1) return `${shortDate} · 1 day ago`;
  if (diffDays < 7) return `${shortDate} · ${diffDays} days ago`;
  if (diffDays < 14) return `${shortDate} · 1 week ago`;
  if (diffDays < 30) return `${shortDate} · ${Math.floor(diffDays / 7)} weeks ago`;
  return `${shortDate} · ${diffDays} days ago`;
}
