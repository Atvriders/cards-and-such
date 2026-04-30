import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  THEMES,
  DEFAULT_THEME,
  STORAGE_KEY,
  applyTheme,
  loadSavedTheme,
  getTheme,
} from "../src/platform/themes.js";

describe("platform/themes", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.removeProperty("--theme-bg");
    document.documentElement.style.removeProperty("--theme-felt");
    document.documentElement.style.removeProperty("--theme-accent");
  });
  afterEach(() => {
    localStorage.clear();
  });

  it("ships at least the 6 documented themes including emerald", () => {
    expect(THEMES.length).toBeGreaterThanOrEqual(6);
    const ids = THEMES.map((t) => t.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "emerald",
        "midnight",
        "ruby",
        "sapphire",
        "slate",
        "espresso",
      ]),
    );
  });

  it("getTheme falls back to the default when given an unknown id", () => {
    expect(getTheme("does-not-exist").id).toBe(DEFAULT_THEME);
    expect(getTheme(null).id).toBe(DEFAULT_THEME);
  });

  it("applyTheme sets CSS variables and persists to localStorage", () => {
    applyTheme("ruby");
    expect(document.documentElement.getAttribute("data-theme")).toBe("ruby");
    const bg = document.documentElement.style.getPropertyValue("--theme-bg");
    const felt = document.documentElement.style.getPropertyValue("--theme-felt");
    expect(bg.length).toBeGreaterThan(0);
    expect(felt.length).toBeGreaterThan(0);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("ruby");
  });

  it("loadSavedTheme returns the persisted choice or default", () => {
    expect(loadSavedTheme()).toBe(DEFAULT_THEME);
    applyTheme("sapphire");
    expect(loadSavedTheme()).toBe("sapphire");
  });

  it("loadSavedTheme ignores garbage in storage", () => {
    localStorage.setItem(STORAGE_KEY, "not-a-real-theme");
    expect(loadSavedTheme()).toBe(DEFAULT_THEME);
  });
});
