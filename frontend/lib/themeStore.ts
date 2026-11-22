import { resolveTheme, type ThemePreference } from "@/lib/theme";

export const THEME_STORAGE_KEY = "watchwave-theme";

const listeners = new Set<() => void>();

function isPreference(value: string | null): value is ThemePreference {
  return value === "auto" || value === "light" || value === "dark";
}

export function getStoredPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return isPreference(value) ? value : "auto";
  } catch {
    return "auto";
  }
}

export function getServerPreference(): ThemePreference {
  return "auto";
}

export function applyPreference(preference: ThemePreference) {
  document.documentElement.dataset.theme = resolveTheme(preference);
}

export function saveStoredPreference(preference: ThemePreference) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // storage can be blocked (private mode); the theme still works for this visit
  }
  applyPreference(preference);
  listeners.forEach((listener) => listener());
}

export function subscribeToPreference(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}
