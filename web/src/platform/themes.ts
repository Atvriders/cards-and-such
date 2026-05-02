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
  | "cyberpunk"
  | "ocean"
  | "neon"
  | "candy"
  | "monochrome"
  | "autumn";

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
  {
    id: "ocean",
    label: "Ocean",
    /* Deep sea teal/cyan tones. */
    swatch: "linear-gradient(180deg, #0e7490 0%, #155e75 60%, #082f49 100%)",
    bgGradient:
      "radial-gradient(1100px 600px at 50% -10%, rgba(34, 211, 238, 0.22), transparent 60%)," +
      "radial-gradient(900px 500px at 50% 120%, rgba(0, 0, 0, 0.55), transparent 60%)," +
      "linear-gradient(180deg, #082f49 0%, #051d2e 100%)",
    feltGradient:
      "radial-gradient(ellipse at 50% -10%, rgba(255, 255, 255, 0.12), transparent 55%)," +
      "radial-gradient(ellipse at 50% 120%, rgba(0, 0, 0, 0.5), transparent 60%)," +
      "linear-gradient(180deg, #0e7490 0%, #155e75 60%, #0c4a6e 100%)",
    accent: "rgba(34, 211, 238, 0.50)",
  },
  {
    id: "neon",
    label: "Neon",
    /* Electric lime + magenta on near-black. */
    swatch: "linear-gradient(180deg, #050505 0%, #d946ef 55%, #a3e635 100%)",
    bgGradient:
      "radial-gradient(1100px 600px at 15% -10%, rgba(217, 70, 239, 0.26), transparent 60%)," +
      "radial-gradient(900px 500px at 90% 30%, rgba(163, 230, 53, 0.22), transparent 60%)," +
      "linear-gradient(180deg, #050507 0%, #0a0a10 100%)",
    feltGradient:
      "radial-gradient(ellipse at 20% 0%, rgba(217, 70, 239, 0.32), transparent 55%)," +
      "radial-gradient(ellipse at 80% 110%, rgba(163, 230, 53, 0.26), transparent 55%)," +
      "radial-gradient(ellipse at 50% 50%, rgba(0, 0, 0, 0.55), transparent 70%)," +
      "linear-gradient(180deg, #0a0a14 0%, #11111d 60%, #050508 100%)",
    accent: "rgba(217, 70, 239, 0.55)",
  },
  {
    id: "candy",
    label: "Candy",
    /* Pastel pink + lavender + mint. */
    swatch: "linear-gradient(180deg, #fbcfe8 0%, #ddd6fe 55%, #a7f3d0 100%)",
    bgGradient:
      "radial-gradient(1100px 600px at 20% -10%, rgba(251, 207, 232, 0.50), transparent 60%)," +
      "radial-gradient(900px 500px at 80% 20%, rgba(221, 214, 254, 0.45), transparent 60%)," +
      "radial-gradient(900px 600px at 50% 120%, rgba(167, 243, 208, 0.40), transparent 60%)," +
      "linear-gradient(180deg, #fdf2f8 0%, #f5f3ff 100%)",
    feltGradient:
      "radial-gradient(ellipse at 50% -10%, rgba(255, 255, 255, 0.30), transparent 55%)," +
      "radial-gradient(ellipse at 50% 120%, rgba(0, 0, 0, 0.10), transparent 60%)," +
      "linear-gradient(180deg, #fbcfe8 0%, #ddd6fe 55%, #a7f3d0 100%)",
    accent: "rgba(244, 114, 182, 0.55)",
  },
  {
    id: "monochrome",
    label: "Monochrome",
    /* Pure grayscale — black to charcoal. */
    swatch: "linear-gradient(180deg, #404040 0%, #1f1f1f 60%, #050505 100%)",
    bgGradient:
      "radial-gradient(1100px 600px at 50% -10%, rgba(255, 255, 255, 0.10), transparent 60%)," +
      "radial-gradient(900px 500px at 50% 120%, rgba(0, 0, 0, 0.65), transparent 60%)," +
      "linear-gradient(180deg, #161616 0%, #050505 100%)",
    feltGradient:
      "repeating-linear-gradient(45deg, rgba(255,255,255,0.020) 0 1px, transparent 1px 4px)," +
      "repeating-linear-gradient(-45deg, rgba(0,0,0,0.030) 0 1px, transparent 1px 4px)," +
      "radial-gradient(ellipse at 50% -10%, rgba(255, 255, 255, 0.08), transparent 55%)," +
      "radial-gradient(ellipse at 50% 120%, rgba(0, 0, 0, 0.55), transparent 60%)," +
      "linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 60%, #0a0a0a 100%)",
    accent: "rgba(229, 229, 229, 0.45)",
  },
  {
    id: "autumn",
    label: "Autumn",
    /* Rust, amber, burnt orange — falling leaves. */
    swatch: "linear-gradient(180deg, #b45309 0%, #9a3412 60%, #7c2d12 100%)",
    bgGradient:
      "radial-gradient(1100px 600px at 30% -10%, rgba(217, 119, 6, 0.24), transparent 60%)," +
      "radial-gradient(900px 500px at 80% 20%, rgba(194, 65, 12, 0.22), transparent 60%)," +
      "radial-gradient(900px 600px at 50% 120%, rgba(0, 0, 0, 0.55), transparent 60%)," +
      "linear-gradient(180deg, #2a1407 0%, #1a0a04 100%)",
    feltGradient:
      "repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 4px)," +
      "repeating-linear-gradient(-45deg, rgba(0,0,0,0.030) 0 1px, transparent 1px 4px)," +
      "radial-gradient(ellipse at 50% -10%, rgba(255, 255, 255, 0.10), transparent 55%)," +
      "radial-gradient(ellipse at 50% 120%, rgba(0, 0, 0, 0.5), transparent 60%)," +
      "linear-gradient(180deg, #b45309 0%, #9a3412 60%, #7c2d12 100%)",
    accent: "rgba(251, 146, 60, 0.50)",
  },
];

export const DEFAULT_THEME: ThemeId = "midnight";
export const STORAGE_KEY = "cards-bg-theme";
export const CUSTOM_STORAGE_KEY = "cards-theme-custom";
/** Sentinel id for the user-defined custom theme. Not part of THEMES. */
export const CUSTOM_THEME_ID = "custom" as const;
export type ThemeChoice = ThemeId | typeof CUSTOM_THEME_ID;

/** Persisted shape of the user's custom theme overrides. */
export interface CustomThemeConfig {
  /** Page background base color as a `#rrggbb` hex string. */
  bg: string;
  /** Surface / panel base color as a `#rrggbb` hex string. */
  surface: string;
  /** Primary accent color as a `#rrggbb` hex string. */
  accent: string;
}

export const DEFAULT_CUSTOM: CustomThemeConfig = {
  bg: "#0a0c16",
  surface: "#14172a",
  accent: "#7c8cf8",
};

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function getTheme(id: ThemeId | string | null | undefined): Theme {
  const found = THEMES.find((t) => t.id === id);
  return found ?? THEMES.find((t) => t.id === DEFAULT_THEME)!;
}

/**
 * Apply CSS variables for a theme to :root *without* persisting. Used for
 * hover-preview in the picker so we can revert cleanly on mouseleave.
 * If `accentOverride` is provided (used by the custom theme) it replaces the
 * theme's built-in accent. `bgOverride` / `surfaceOverride` likewise replace
 * the theme's bg gradient and felt/surface — used by the custom theme so all
 * three CSS vars reflect the user's picks.
 */
export function previewTheme(
  id: ThemeId,
  accentOverride?: string,
  bgOverride?: string,
  surfaceOverride?: string,
): void {
  const theme = getTheme(id);
  const root = typeof document !== "undefined" ? document.documentElement : null;
  if (!root) return;
  root.style.setProperty("--theme-bg", bgOverride ?? theme.bgGradient);
  root.style.setProperty("--theme-felt", surfaceOverride ?? theme.feltGradient);
  root.style.setProperty("--theme-surface", surfaceOverride ?? theme.feltGradient);
  root.style.setProperty("--theme-accent", accentOverride ?? theme.accent);
  root.setAttribute("data-theme", theme.id);
}

/**
 * Apply a theme to the document. Sets CSS variables on the root element so
 * App.css / engine CSS can pick them up via `var(--theme-bg)` etc.
 * Persists the selection to localStorage.
 */
export function applyTheme(id: ThemeId): void {
  previewTheme(id);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, getTheme(id).id);
    }
  } catch {
    /* ignore storage failures (private mode, quota, SSR) */
  }
}

/** Read the saved custom-theme JSON, falling back to DEFAULT_CUSTOM.
 *  Each field is validated independently so legacy blobs that only set
 *  `accent` (the v1 schema) still load with sensible bg/surface defaults. */
export function loadCustomTheme(): CustomThemeConfig {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CustomThemeConfig> | null;
        if (parsed && typeof parsed === "object") {
          const out = { ...DEFAULT_CUSTOM };
          if (typeof parsed.bg === "string" && HEX_RE.test(parsed.bg)) out.bg = parsed.bg;
          if (typeof parsed.surface === "string" && HEX_RE.test(parsed.surface)) out.surface = parsed.surface;
          if (typeof parsed.accent === "string" && HEX_RE.test(parsed.accent)) out.accent = parsed.accent;
          return out;
        }
      }
    }
  } catch {
    /* ignore JSON / storage errors */
  }
  return { ...DEFAULT_CUSTOM };
}

/** Persist a custom-theme config (does not change the active theme id). */
export function saveCustomTheme(cfg: CustomThemeConfig): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(cfg));
    }
  } catch {
    /* ignore */
  }
}

/**
 * Apply the custom theme: overrides `--theme-bg`, `--theme-felt` /
 * `--theme-surface`, and `--theme-accent` with the user's three picks
 * (using Midnight as the base for any vars that are not overridden).
 * Persists `cards-bg-theme=custom`.
 */
export function applyCustomTheme(cfg: CustomThemeConfig): void {
  previewTheme(DEFAULT_THEME, cfg.accent, cfg.bg, cfg.surface);
  const root = typeof document !== "undefined" ? document.documentElement : null;
  if (root) root.setAttribute("data-theme", CUSTOM_THEME_ID);
  saveCustomTheme(cfg);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, CUSTOM_THEME_ID);
    }
  } catch {
    /* ignore */
  }
}

/** Read the saved theme choice (one of THEMES ids or `"custom"`). */
export function loadSavedThemeChoice(): ThemeChoice {
  try {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === CUSTOM_THEME_ID) return CUSTOM_THEME_ID;
      if (saved && THEMES.some((t) => t.id === saved)) {
        return saved as ThemeId;
      }
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_THEME;
}

/**
 * Read the saved theme (or the default) without applying. Returns the
 * underlying base ThemeId — if the user has selected the custom theme
 * the base id (`DEFAULT_THEME`) is returned for back-compat with code
 * that only knows about the canonical 10 themes.
 */
export function loadSavedTheme(): ThemeId {
  const choice = loadSavedThemeChoice();
  return choice === CUSTOM_THEME_ID ? DEFAULT_THEME : choice;
}

/**
 * Apply whatever theme is currently saved. Handles the "custom" branch by
 * also reading the accent JSON. Use this on app boot.
 */
export function applySavedTheme(): void {
  const choice = loadSavedThemeChoice();
  if (choice === CUSTOM_THEME_ID) {
    applyCustomTheme(loadCustomTheme());
  } else {
    applyTheme(choice);
  }
}
