/**
 * Calendar "today" in a fixed IANA timezone (default UAE).
 * Avoid relying on client device clocks — use this on the server for business rules.
 */

export function getTodayYmd(timeZone = process.env.APP_TIMEZONE || "Asia/Dubai") {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${d}`;
}
