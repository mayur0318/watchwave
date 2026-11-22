import { useSyncExternalStore } from "react";
import {
  getServerPreference,
  getStoredPreference,
  subscribeToPreference,
} from "@/lib/themeStore";

export function useThemePreference() {
  return useSyncExternalStore(
    subscribeToPreference,
    getStoredPreference,
    getServerPreference,
  );
}
