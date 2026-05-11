import { beforeEach, describe, expect, it } from "vitest";
import {
  CUSTOM_STORAGE_KEY,
  CUSTOM_THEME_ID,
  DEFAULT_CUSTOM,
  DEFAULT_THEME,
  STORAGE_KEY,
  THEMES,
  applyCustomTheme,
  applyTheme,
  getTheme,
  loadCustomTheme,
  loadSavedThemeChoice,
  saveCustomTheme,
} from "./themes";

describe("themes registry", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("style");
  });

  it("getTheme returns matching theme and falls back to DEFAULT_THEME for unknown ids", () => {
    const midnight = getTheme("midnight");
    expect(midnight.id).toBe("midnight");
    expect(midnight.label).toBe("Midnight");

    const fallback = getTheme("does-not-exist");
    expect(fallback.id).toBe(DEFAULT_THEME);

    // Each registered theme has the required string fields.
    for (const t of THEMES) {
      expect(typeof t.bgGradient).toBe("string");
      expect(typeof t.feltGradient).toBe("string");
      expect(typeof t.accent).toBe("string");
      expect(t.bgGradient.length).toBeGreaterThan(0);
    }
  });

  it("applyTheme sets CSS variables + data-theme and persists to localStorage", () => {
    applyTheme("ruby");

    const root = document.documentElement;
    expect(root.getAttribute("data-theme")).toBe("ruby");
    const ruby = getTheme("ruby");
    expect(root.style.getPropertyValue("--theme-bg")).toBe(ruby.bgGradient);
    expect(root.style.getPropertyValue("--theme-felt")).toBe(ruby.feltGradient);
    expect(root.style.getPropertyValue("--theme-accent")).toBe(ruby.accent);

    expect(localStorage.getItem(STORAGE_KEY)).toBe("ruby");
    expect(loadSavedThemeChoice()).toBe("ruby");
  });

  it("custom theme save/load validates hex and applyCustomTheme persists the custom sentinel", () => {
    // Invalid hex on accent gets dropped, valid bg/surface kept.
    localStorage.setItem(
      CUSTOM_STORAGE_KEY,
      JSON.stringify({ bg: "#112233", surface: "#abcdef", accent: "not-a-color" }),
    );
    const loaded = loadCustomTheme();
    expect(loaded.bg).toBe("#112233");
    expect(loaded.surface).toBe("#abcdef");
    expect(loaded.accent).toBe(DEFAULT_CUSTOM.accent);

    // saveCustomTheme + applyCustomTheme round-trip.
    const cfg = { bg: "#010203", surface: "#0a0b0c", accent: "#ff00ff" };
    saveCustomTheme(cfg);
    expect(JSON.parse(localStorage.getItem(CUSTOM_STORAGE_KEY)!)).toEqual(cfg);

    applyCustomTheme(cfg);
    const root = document.documentElement;
    expect(root.getAttribute("data-theme")).toBe(CUSTOM_THEME_ID);
    expect(root.style.getPropertyValue("--theme-bg")).toBe(cfg.bg);
    expect(root.style.getPropertyValue("--theme-felt")).toBe(cfg.surface);
    expect(root.style.getPropertyValue("--theme-accent")).toBe(cfg.accent);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(CUSTOM_THEME_ID);
    expect(loadSavedThemeChoice()).toBe(CUSTOM_THEME_ID);
  });
});
