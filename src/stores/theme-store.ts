import { Store } from "@tanstack/react-store";
import type { Theme } from "@/constants";

const themeValues = ["light", "dark", "system"] as const;

export const THEME_STORAGE_KEY = "theme";
export const DEFAULT_THEME: Theme = "system";

function isTheme(value: string | null): value is Theme {
  return (
    typeof value === "string" &&
    (themeValues as readonly string[]).includes(value)
  );
}

export function readStoredTheme(storageKey = THEME_STORAGE_KEY): Theme | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function persistTheme(theme: Theme, storageKey = THEME_STORAGE_KEY) {
  try {
    window.localStorage.setItem(storageKey, theme);
  } catch {
    // Ignore storage failures (private mode, disabled storage, etc.)
  }
}

export const themeStore = new Store<Theme>(DEFAULT_THEME);
