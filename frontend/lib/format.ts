export function formatDuration(totalSeconds: number): string {
  const seconds = Math.floor(totalSeconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const ss = String(s).padStart(2, "0");

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  }
  return `${m}:${ss}`;
}

const compactNumber = new Intl.NumberFormat("en", { notation: "compact" });

export function formatViews(views: number): string {
  return `${compactNumber.format(views)} ${views === 1 ? "view" : "views"}`;
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatSubscribers(count: number): string {
  return `${compactNumber.format(count)} ${count === 1 ? "subscriber" : "subscribers"}`;
}
