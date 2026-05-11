import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ThemePicker from "./ThemePicker.js";
import {
  STORAGE_KEY,
  CUSTOM_STORAGE_KEY,
  CUSTOM_THEME_ID,
  getTheme,
} from "../themes.js";

describe("ThemePicker", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("style");
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("style");
  });

  it("renders the trigger collapsed and opens the swatch grid on click", () => {
    render(<ThemePicker />);

    const trigger = screen.getByRole("button", {
      name: /choose background theme/i,
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    // Closed: no dialog / swatches mounted.
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByTestId("theme-row-ruby")).toBeNull();

    fireEvent.click(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // Canonical swatches + the custom entry rendered.
    expect(screen.getByTestId("theme-row-ruby")).toBeInTheDocument();
    expect(screen.getByTestId("theme-row-midnight")).toBeInTheDocument();
    expect(screen.getByTestId("theme-row-custom")).toBeInTheDocument();
  });

  it("selecting a swatch applies the theme to :root, persists it, and stamps cards-themes-tried", () => {
    render(<ThemePicker />);

    fireEvent.click(
      screen.getByRole("button", { name: /choose background theme/i }),
    );

    const ruby = screen.getByTestId("theme-row-ruby");
    fireEvent.click(ruby);

    // Persistence: applyTheme writes STORAGE_KEY, and stampTried records ruby.
    expect(localStorage.getItem(STORAGE_KEY)).toBe("ruby");
    const tried = JSON.parse(
      localStorage.getItem("cards-themes-tried") ?? "[]",
    );
    expect(tried).toContain("ruby");

    // Side-effect on the document root via applyTheme -> previewTheme.
    const root = document.documentElement;
    expect(root.getAttribute("data-theme")).toBe("ruby");
    const rubyTheme = getTheme("ruby");
    expect(root.style.getPropertyValue("--theme-bg")).toBe(rubyTheme.bgGradient);
    expect(root.style.getPropertyValue("--theme-accent")).toBe(rubyTheme.accent);

    // Popover closes after selection.
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("hovering a swatch live-previews its CSS vars, and mouse-leave reverts to the saved theme", () => {
    // Start with sapphire saved so we can verify the revert is to the
    // persisted choice (not the registry default).
    localStorage.setItem(STORAGE_KEY, "sapphire");
    render(<ThemePicker />);

    fireEvent.click(
      screen.getByRole("button", { name: /choose background theme/i }),
    );

    const aurora = screen.getByTestId("theme-row-aurora");
    const auroraTheme = getTheme("aurora");
    const sapphireTheme = getTheme("sapphire");
    const root = document.documentElement;

    // Hover: preview applied (no persistence).
    fireEvent.mouseEnter(aurora);
    expect(root.getAttribute("data-theme")).toBe("aurora");
    expect(root.style.getPropertyValue("--theme-bg")).toBe(auroraTheme.bgGradient);
    // STORAGE_KEY untouched by the preview.
    expect(localStorage.getItem(STORAGE_KEY)).toBe("sapphire");

    // Leaving the swatch reverts via applySavedTheme -> "sapphire".
    fireEvent.blur(aurora);
    expect(root.getAttribute("data-theme")).toBe("sapphire");
    expect(root.style.getPropertyValue("--theme-bg")).toBe(sapphireTheme.bgGradient);
  });

  it("selecting Custom applies the custom theme, reveals the accent input, and updating it persists the new accent", () => {
    render(<ThemePicker />);

    fireEvent.click(
      screen.getByRole("button", { name: /choose background theme/i }),
    );

    // Before custom selection the accent input is not rendered.
    expect(screen.queryByTestId("theme-picker-custom")).toBeNull();

    fireEvent.click(screen.getByTestId("theme-row-custom"));

    // Custom committed: STORAGE_KEY = "custom", data-theme = "custom".
    expect(localStorage.getItem(STORAGE_KEY)).toBe(CUSTOM_THEME_ID);
    expect(document.documentElement.getAttribute("data-theme")).toBe(
      CUSTOM_THEME_ID,
    );
    // tried list records the custom sentinel as well.
    const tried = JSON.parse(
      localStorage.getItem("cards-themes-tried") ?? "[]",
    );
    expect(tried).toContain(CUSTOM_THEME_ID);

    // Accent input now revealed; changing it pushes a new accent into the
    // saved custom config and into the --theme-accent CSS var.
    const accentInput = screen.getByTestId(
      "theme-custom-accent",
    ) as HTMLInputElement;
    expect(accentInput).toBeInTheDocument();

    act(() => {
      fireEvent.change(accentInput, { target: { value: "#ff00aa" } });
    });

    const persisted = JSON.parse(
      localStorage.getItem(CUSTOM_STORAGE_KEY) ?? "{}",
    );
    expect(persisted.accent).toBe("#ff00aa");
    expect(
      document.documentElement.style.getPropertyValue("--theme-accent"),
    ).toBe("#ff00aa");
  });
});
