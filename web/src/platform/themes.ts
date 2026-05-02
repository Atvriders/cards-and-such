/**
 * Site-wide background / felt-table theme registry.
 *
 * Each theme provides:
 *   - bgGradient    The body / AppShell backdrop (page-level paint).
 *   - feltGradient  The felt-table colour applied to engine wraps
 *                   (.sol-wrap, .dm-wrap, .blackjack-wrap, .casino-wrap, ...).
 *                   Engines fall back to their own emerald defaults via
 *                   `var(--theme-felt, <existing-fallback>)` so anything
 *                   that hasn't opted in still renders.
 *   - accent        Soft glow / hairline accent that harmonises with the
 *                   chosen felt — used for HUD chips, log panels, etc.
 *
 * The selection is persisted in localStorage under `cards-bg-theme`.
 */

export type ThemeId =
  | "emerald"
  | "midnight"
  | "ruby"
  | "sapphire"
  | "slate"
  | "espresso"
  | "aurora"
  | "sunset"
  | "forest"
  | "cyberpunk";

export interface Theme {
  id: ThemeId;
  label: string;
  /** Used for the small swatch preview in the picker. */
  swatch: string;
  /** Page-level body background (AppShell wrapper). */
  bgGradient: string;
  /** Felt-table gradient applied via `--theme-felt`. */
  feltGradient: string;
  /** Soft accent color for HUD chips / glows that harmonises with the felt. */
  accent: string;
}

const MIDNIGHT_BG =
  "radial-gradient(1200px 700px at 12% -10%, rgba(99, 102, 241, 0.18), transparent 60%)," +
  "radial-gradient(900px 600px at 110% 10%, rgba(168, 85, 247, 0.16), transparent 60%)," +
  "radial-gradient(800px 500px at 50% 110%, rgba(16, 185, 129, 0.10), transparent 60%)," +
  "linear-gradient(180deg, #07080f 0%, #0a0c16 100%)";

export const THEMES: Theme[] = [
  {
    id: "emerald",
    label: "Emerald Felt",
    /* Vivid classic-billiard green tuned to the reference solitaire screenshot.
       Slightly brighter & warmer than before; pairs with the new vignette. */
    swatch: "linear-gradient(180deg, #2c8a55 0%, #20693f 100%)",
    bgGradient:
      "radial-gradient(1100px 600px at 50% -10%, rgba(34, 197, 94, 0.22), transparent 60%)," +
      "radial-gradient(900px 500px at 50% 120%, rgba(0, 0, 0, 0.55), transparent 60%)," +
      "linear-gradient(180deg, #1a6c3f 0%, #0f4527 100%)",
    /* Felt now layers a faint fiber texture (repeating linear gradients) on top
       of the lit gradient, so the table reads as woven cloth, not flat color. */
    feltGradient:
      "repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 4px)," +
      "repeating-linear-gradient(-45deg, rgba(0,0,0,0.025) 0 1px, transparent 1px 4px)," +
      "radial-gradient(ellipse at 50% -10%, rgba(255, 255, 255, 0.14), transparent 55%)," +
      "radial-gradient(ellipse at 50% 120%, rgba(0, 0, 0, 0.55), transparent 60%)," +
      "linear-gradient(180deg, #2c8a55 0%, #20693f 60%, #16502d 100%)",
    accent: "rgba(74, 222, 128, 0.50)",
  },
  {
    id: "midnight",
    label: "Midnight",
    swatch: "linear-gradient(180deg, #0b0b12 0%, #11121a 100%)",
    bgGradient: MIDNIGHT_BG,
    feltGradient:
      "radial-gradient(ellipse at 50% -10%, rgba(255, 255, 255, 0.08), transparent 55%)," +
      "radial-gradient(ellipse at 50% 120%, rgba(0, 0, 0, 0.45), transparent 60%)," +
      "linear-gradient(180deg, #14172a 0%, #0e101e 60%, #090a14 100%)",
    accent: "rgba(129, 140, 248, 0.45)",
  },
  {
    id: "ruby",
    label: "Ruby Velvet",
    swatch: "linear-gradient(180deg, #5b1f23 0%, #3f1416 100%)",
    bgGradient:
      "radial-gradient(1100px 600px at 50% -10%, rgba(248, 113, 113, 0.18), transparent 60%)," +
      "radial-gradient(900px 500px at 50% 120%, rgba(0, 0, 0, 0.55), transparent 60%)," +
      "linear-gradient(180deg, #3f1416 0%, #2a0c0e 100%)",
    feltGradient:
      "radial-gradient(ellipse at 50% -10%, rgba(255, 255, 255, 0.10), transparent 55%)," +
      "radial-gradient(ellipse at 50% 120%, rgba(0, 0, 0, 0.5), transparent 60%)," +
      "linear-gradient(180deg, #5b1f23 0%, #3f1416 60%, #2a0c0e 100%)",
    accent: "rgba(248, 113, 113, 0.45)",
  },
  {
    id: "sapphire",
    label: "Royal Sapphire",
    swatch: "linear-gradient(180deg, #1a2b66 0%, #14224d 100%)",
    bgGradient:
      "radial-gradient(1100px 600px at 50% -10%, rgba(99, 102, 241, 0.22), transparent 60%)," +
      "radial-gradient(900px 500px at 50% 120%, rgba(0, 0, 0, 0.55), transparent 60%)," +
      "linear-gradient(180deg, #14224d 0%, #0c163a 100%)",
    feltGradient:
      "radial-gradient(ellipse at 50% -10%, rgba(255, 255, 255, 0.10), transparent 55%)," +
      "radial-gradient(ellipse at 50% 120%, rgba(0, 0, 0, 0.5), transparent 60%)," +
      "linear-gradient(180deg, #1a2b66 0%, #14224d 60%, #0d1735 100%)",
    accent: "rgba(129, 140, 248, 0.45)",
  },
  {
    id: "slate",
    label: "Slate",
    swatch: "linear-gradient(180deg, #2a2f38 0%, #1d2128 100%)",
    bgGradient:
      "radial-gradient(1100px 600px at 50% -10%, rgba(148, 163, 184, 0.14), transparent 60%)," +
      "radial-gradient(900px 500px at 50% 120%, rgba(0, 0, 0, 0.55), transparent 60%)," +
      "linear-gradient(180deg, #1d2128 0%, #11141a 100%)",
    feltGradient:
      "radial-gradient(ellipse at 50% -10%, rgba(255, 255, 255, 0.08), transparent 55%)," +
      "radial-gradient(ellipse at 50% 120%, rgba(0, 0, 0, 0.5), transparent 60%)," +
      "linear-gradient(180deg, #2a2f38 0%, #1d2128 60%, #14171c 100%)",
    accent: "rgba(148, 163, 184, 0.40)",
  },
  {
    id: "espresso",
    label: "Espresso",
    swatch: "linear-gradient(180deg, #3b2a1e 0%, #2a1d12 100%)",
    bgGradient:
      "radial-gradient(1100px 600px at 50% -10%, rgba(217, 119, 6, 0.16), transparent 60%)," +
      "radial-gradient(900px 500px at 50% 120%, rgba(0, 0, 0, 0.55), transparent 60%)," +
      "linear-gradient(180deg, #2a1d12 0%, #1d1309 100%)",
    feltGradient:
      "radial-gradient(ellipse at 50% -10%, rgba(255, 255, 255, 0.08), transparent 55%)," +
      "radial-gradient(ellipse at 50% 120%, rgba(0, 0, 0, 0.5), transparent 60%)," +
      "linear-gradient(180deg, #3b2a1e 0%, #2a1d12 60%, #1d1309 100%)",
    accent: "rgba(245, 158, 11, 0.40)",
  },
  {
    id: "aurora",
    label: "Aurora",
    /* Northern-lights gradient: teal → violet → pink. */
    swatch:
      "linear-gradient(180deg, #14b8a6 0%, #8b5cf6 55%, #ec4899 100%)",
    bgGradient:
      "radial-gradient(1100px 600px at 20% -10%, rgba(20, 184, 166, 0.28), transparent 60%)," +
      "radial-gradient(900px 500px at 80% 10%, rgba(139, 92, 246, 0.26), transparent 60%)," +
      "radial-gradient(900px 600px at 50% 120%, rgba(236, 72, 153, 0.20), transparent 60%)," +
      "linear-gradient(180deg, #0c2436 0%, #1a1240 50%, #2a1233 100%)",
    feltGradient:
      "radial-gradient(ellipse at 50% -10%, rgba(255, 255, 255, 0.12), transparent 55%)," +
      "radial-gradient(ellipse at 50% 120%, rgba(0, 0, 0, 0.45), transparent 60%)," +
      "linear-gradient(180deg, #14b8a6 0%, #8b5cf6 55%, #ec4899 100%)",
    accent: "rgba(167, 139, 250, 0.50)",
  },
  {
    id: "sunset",
    label: "Sunset",
    /* Warm orange → pink horizon. */
    swatch:
      "linear-gradient(180deg, #f97316 0%, #ec4899 100%)",
    bgGradient:
      "radial-gradient(1100px 600px at 50% -10%, rgba(249, 115, 22, 0.28), transparent 60%)," +
      "radial-gradient(900px 500px at 50% 120%, rgba(236, 72, 153, 0.22), transparent 60%)," +
      "linear-gradient(180deg, #3a1418 0%, #2a0c14 100%)",
    feltGradient:
      "radial-gradient(ellipse at 50% -10%, rgba(255, 255, 255, 0.12), transparent 55%)," +
      "radial-gradient(ellipse at 50% 120%, rgba(0, 0, 0, 0.45), transparent 60%)," +
      "linear-gradient(180deg, #f97316 0%, #db2777 60%, #9d174d 100%)",
    accent: "rgba(251, 146, 60, 0.50)",
  },
  {
    id: "forest",
    label: "Forest",
    /* Deep green → moss canopy. */
    swatch:
      "linear-gradient(180deg, #14532d 0%, #4d7c0f 100%)",
    bgGradient:
      "radial-gradient(1100px 600px at 50% -10%, rgba(77, 124, 15, 0.22), transparent 60%)," +
      "radial-gradient(900px 500px at 50% 120%, rgba(0, 0, 0, 0.55), transparent 60%)," +
      "linear-gradient(180deg, #14271a 0%, #0a1810 100%)",
    feltGradient:
      "repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 4px)," +
      "repeating-linear-gradient(-45deg, rgba(0,0,0,0.025) 0 1px, transparent 1px 4px)," +
      "radial-gradient(ellipse at 50% -10%, rgba(255, 255, 255, 0.10), transparent 55%)," +
      "radial-gradient(ellipse at 50% 120%, rgba(0, 0, 0, 0.5), transparent 60%)," +
      "linear-gradient(180deg, #14532d 0%, #2f6b1f 60%, #4d7c0f 100%)",
    accent: "rgba(132, 204, 22, 0.45)",
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    /* Black + neon magenta + cyan accents. */
    swatch:
      "linear-gradient(180deg, #0a0a0f 0%, #ec0c8d 60%, #06b6d4 100%)",
    bgGradient:
      "radial-gradient(1100px 600px at 15% -10%, rgba(236, 12, 141, 0.22), transparent 60%)," +
      "radial-gradient(900px 500px at 95% 20%, rgba(6, 182, 212, 0.20), transparent 60%)," +
      "radial-gradient(800px 500px at 50% 120%, rgba(168, 85, 247, 0.14), transparent 60%)," +
      "linear-gradient(180deg, #07070d 0%, #0a0a14 100%)",
    feltGradient:
      "radial-gradient(ellipse at 20% 0%, rgba(236, 12, 141, 0.30), transparent 55%)," +
      "radial-gradient(ellipse at 80% 110%, rgba(6, 182, 212, 0.28), transparent 55%)," +
      "radial-gradient(ellipse at 50% 50%, rgba(0, 0, 0, 0.50), transparent 70%)," +
      "linear-gradient(180deg, #0a0a14 0%, #11111d 60%, #07070d 100%)",
    accent: "rgba(34, 211, 238, 0.55)",
  },
];

export const DEFAULT_THEME: ThemeId = "midnight";
export const STORAGE_KEY = "cards-bg-theme";

export function getTheme(id: ThemeId | string | null | undefined): Theme {
  const found = THEMES.find((t) => t.id === id);
  return found ?? THEMES.find((t) => t.id === DEFAULT_THEME)!;
}

/**
 * Apply a theme to the document. Sets CSS variables on the root element so
 * App.css / engine CSS can pick them up via `var(--theme-bg)` etc.
 * Persists the selection to localStorage.
 */
export function applyTheme(id: ThemeId): void {
  const theme = getTheme(id);
  const root = typeof document !== "undefined" ? document.documentElement : null;
  if (root) {
    root.style.setProperty("--theme-bg", theme.bgGradient);
    root.style.setProperty("--theme-felt", theme.feltGradient);
    root.style.setProperty("--theme-accent", theme.accent);
    root.setAttribute("data-theme", theme.id);
  }
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, theme.id);
    }
  } catch {
    /* ignore storage failures (private mode, quota, SSR) */
  }
}

/** Read the saved theme (or the default) without applying. */
export function loadSavedTheme(): ThemeId {
  try {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && THEMES.some((t) => t.id === saved)) {
        return saved as ThemeId;
      }
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_THEME;
}
