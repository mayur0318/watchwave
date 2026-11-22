"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useThemePreference } from "@/hooks/useThemePreference";
import { applyPreference, saveStoredPreference } from "@/lib/themeStore";

export default function ThemeManager() {
  const preference = useThemePreference();
  const { user } = useAuth();

  // The account's saved theme wins when someone is logged in
  useEffect(() => {
    if (user) {
      saveStoredPreference(user.theme);
    }
  }, [user]);

  // Apply the theme to <html>, and re-check every minute for the IST boundaries
  useEffect(() => {
    applyPreference(preference);
    const id = window.setInterval(() => applyPreference(preference), 60_000);
    return () => window.clearInterval(id);
  }, [preference]);

  return null;
}
