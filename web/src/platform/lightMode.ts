/**
 * Light-mode preference helpers.
 *
 * The active palette is controlled by a single `data-light` attribute on
 * `:root`. When present (`document.documentElement.dataset.light = "1"`),
 * `App.css` applies the `:root[data-light]` token overrides which flip the
 * background, surface, text and border colours to a light palette.
 *
 * Persistence:
 *   - localStorage key: `cards-light-mode` ("1" = light, "0" = dark, missing
 *     = follow system).
 *
 * First-time users: if no preference is stored we honour
 * `prefers-color-scheme: light`, defaulting to dark on systems that report
 * dark or no preference.
 *
 * Felt-table backgrounds (the green/wine/navy gradients used by the
 * solitaire / blackjack / casino engines) intentionally stay dark for game
 * immersion — the override only touches global tokens, not the per-engine
 * felt classes (`.sol-wrap`, `.bj-wrap`, …).
 */

export const LIGHT_STORAGE_KEY = "cards-light-mode";

export function isLightMode(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.light === "1";
}

/**
 * Set the data-light attribute and persist the choice.
 * Pass `null` to clear the persisted choice and fall back to system pref.
 */
export function applyLightMode(light: boolean): void {
  if (typeof document === "undefined") return;
  if (light) {
    document.documentElement.dataset.light = "1";
  } else {
    delete document.documentElement.dataset.light;
  }
  try {
    localStorage.setItem(LIGHT_STORAGE_KEY, light ? "1" : "0");
  } catch {
    /* storage unavailable — best-effort */
  }
}

/**
 * Read the stored preference, falling back to `prefers-color-scheme: light`
 * for first-time users. Returns true when the user prefers light mode.
 */
export function loadSavedLightMode(): boolean {
  try {
    const saved = localStorage.getItem(LIGHT_STORAGE_KEY);
    if (saved === "1") return true;
    if (saved === "0") return false;
  } catch {
    /* storage unavailable */
  }
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    try {
      return window.matchMedia("(prefers-color-scheme: light)").matches;
    } catch {
      /* matchMedia threw — fall through */
    }
  }
  return false;
}

/**
 * Boot helper: synchronously applies the saved preference (or system pref)
 * to the documentElement before React mounts. Safe to call in SSR — no-ops
 * when `document` is undefined.
 */
export function applySavedLightMode(): void {
  if (typeof document === "undefined") return;
  const light = loadSavedLightMode();
  if (light) {
    document.documentElement.dataset.light = "1";
  } else {
    delete document.documentElement.dataset.light;
  }
}
