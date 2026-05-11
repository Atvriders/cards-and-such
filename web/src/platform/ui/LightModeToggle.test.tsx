import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import LightModeToggle from "./LightModeToggle.js";
import { LIGHT_STORAGE_KEY } from "../lightMode.js";

describe("LightModeToggle", () => {
  beforeEach(() => {
    delete document.documentElement.dataset.light;
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    delete document.documentElement.dataset.light;
    localStorage.clear();
  });

  it("renders a button pressed=false reflecting initial dark mode", () => {
    render(<LightModeToggle />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(btn).toHaveAttribute("aria-label", "Switch to light mode");
    expect(btn.className).not.toContain("is-light");
  });

  it("reflects initial light mode from the documentElement attribute", () => {
    document.documentElement.dataset.light = "1";
    render(<LightModeToggle />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(btn).toHaveAttribute("aria-label", "Switch to dark mode");
    expect(btn.className).toContain("is-light");
  });

  it("clicking toggles data-light attribute, localStorage and aria-pressed", () => {
    render(<LightModeToggle />);
    const btn = screen.getByRole("button");

    // dark -> light
    fireEvent.click(btn);
    expect(document.documentElement.dataset.light).toBe("1");
    expect(localStorage.getItem(LIGHT_STORAGE_KEY)).toBe("1");
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(btn).toHaveAttribute("aria-label", "Switch to dark mode");
    expect(btn.className).toContain("is-light");

    // light -> dark
    fireEvent.click(btn);
    expect(document.documentElement.dataset.light).toBeUndefined();
    expect(localStorage.getItem(LIGHT_STORAGE_KEY)).toBe("0");
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(btn).toHaveAttribute("aria-label", "Switch to light mode");
    expect(btn.className).not.toContain("is-light");
  });

  it("renders sun glyph in dark mode and moon glyph after toggling to light", () => {
    const { container } = render(<LightModeToggle />);
    const btn = screen.getByRole("button");
    // Dark mode: sun icon — has a <circle> element.
    expect(btn.querySelector("svg circle")).not.toBeNull();

    // Click toggles to light mode — should now render the moon glyph.
    fireEvent.click(btn);
    const svg = container.querySelector("button svg");
    expect(svg).not.toBeNull();
    // Moon mode: no <circle>, just a <path>.
    expect(svg?.querySelector("circle")).toBeNull();
    expect(svg?.querySelector("path")).not.toBeNull();
  });
});
