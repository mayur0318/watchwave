"use client";

import { useAuth } from "@/context/AuthContext";
import { useThemePreference } from "@/hooks/useThemePreference";
import { updateTheme } from "@/lib/api";
import type { ThemePreference } from "@/lib/theme";
import { saveStoredPreference } from "@/lib/themeStore";

const NEXT: Record<ThemePreference, ThemePreference> = {
  auto: "light",
  light: "dark",
  dark: "auto",
};

const LABELS: Record<ThemePreference, string> = {
  auto: "Auto (IST)",
  light: "Light",
  dark: "Dark",
};

function ThemeIcon({ preference }: { preference: ThemePreference }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {preference === "light" && (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </>
      )}
      {preference === "dark" && (
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      )}
      {preference === "auto" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

export default function ThemeToggle() {
  const preference = useThemePreference();
  const { user } = useAuth();

  function handleClick() {
    const next = NEXT[preference];
    saveStoredPreference(next);
    if (user) {
      updateTheme(next).catch(() => {
        // the device keeps the choice even if saving to the account failed
      });
    }
  }

  const label = `Theme: ${LABELS[preference]}. Click to change.`;

  return (
    <button
      onClick={handleClick}
      aria-label={label}
      title={label}
      className="rounded p-2 text-muted hover:bg-surface-2 hover:text-fg"
    >
      <ThemeIcon preference={preference} />
    </button>
  );
}
