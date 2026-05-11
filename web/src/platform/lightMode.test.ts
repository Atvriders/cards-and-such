import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  LIGHT_STORAGE_KEY,
  applyLightMode,
  applySavedLightMode,
  isLightMode,
  loadSavedLightMode,
} from "./lightMode.js";

describe("lightMode", () => {
  beforeEach(() => {
    delete document.documentElement.dataset.light;
    localStorage.clear();
  });

  afterEach(() => {
    delete document.documentElement.dataset.light;
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("applyLightMode(true) sets the data-light attribute and persists '1'", () => {
    expect(isLightMode()).toBe(false);
    applyLightMode(true);
    expect(document.documentElement.dataset.light).toBe("1");
    expect(isLightMode()).toBe(true);
    expect(localStorage.getItem(LIGHT_STORAGE_KEY)).toBe("1");
  });

  it("applyLightMode(false) removes the attribute and persists '0'", () => {
    document.documentElement.dataset.light = "1";
    applyLightMode(false);
    expect(document.documentElement.dataset.light).toBeUndefined();
    expect(isLightMode()).toBe(false);
    expect(localStorage.getItem(LIGHT_STORAGE_KEY)).toBe("0");
  });

  it("loadSavedLightMode honors stored '1'/'0' and falls back to matchMedia", () => {
    localStorage.setItem(LIGHT_STORAGE_KEY, "1");
    expect(loadSavedLightMode()).toBe(true);
    localStorage.setItem(LIGHT_STORAGE_KEY, "0");
    expect(loadSavedLightMode()).toBe(false);
    localStorage.removeItem(LIGHT_STORAGE_KEY);

    const mql = { matches: true } as unknown as MediaQueryList;
    const spy = vi
      .spyOn(window, "matchMedia")
      .mockImplementation(() => mql);
    expect(loadSavedLightMode()).toBe(true);
    expect(spy).toHaveBeenCalledWith("(prefers-color-scheme: light)");
  });

  it("applySavedLightMode applies the stored preference to documentElement", () => {
    localStorage.setItem(LIGHT_STORAGE_KEY, "1");
    applySavedLightMode();
    expect(document.documentElement.dataset.light).toBe("1");

    localStorage.setItem(LIGHT_STORAGE_KEY, "0");
    applySavedLightMode();
    expect(document.documentElement.dataset.light).toBeUndefined();
  });
});
