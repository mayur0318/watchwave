export type ThemePreference = "auto" | "light" | "dark";
export type Theme = "light" | "dark";

const IST_TIME_ZONE = "Asia/Kolkata";
const LIGHT_START_HOUR = 5; // 5 AM, included
const LIGHT_END_HOUR = 12; // 12 PM (noon), not included

const istHourFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: IST_TIME_ZONE,
  hour: "numeric",
  hourCycle: "h23",
});

export function getIstHour(now: Date = new Date()): number {
  return Number(istHourFormatter.format(now));
}

export function getAutoTheme(now: Date = new Date()): Theme {
  const hour = getIstHour(now);
  return hour >= LIGHT_START_HOUR && hour < LIGHT_END_HOUR ? "light" : "dark";
}

export function resolveTheme(
  preference: ThemePreference,
  now: Date = new Date(),
): Theme {
  if (preference === "auto") {
    return getAutoTheme(now);
  }
  return preference;
}
