import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemePicker from "../src/platform/ui/ThemePicker.js";
import { STORAGE_KEY } from "../src/platform/themes.js";

describe("ThemePicker", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });
  afterEach(() => localStorage.clear());

  it("renders a closed picker button by default", () => {
    render(<ThemePicker />);
    const trigger = screen.getByRole("button", { name: /choose background theme/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the popover and lists every theme as a radio option", async () => {
    const user = userEvent.setup();
    render(<ThemePicker />);
    await user.click(screen.getByRole("button", { name: /choose background theme/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // 6 swatches: emerald, midnight, ruby, sapphire, slate, espresso.
    const options = screen.getAllByRole("radio");
    expect(options.length).toBeGreaterThanOrEqual(6);
  });

  it("selecting a theme applies it, persists, and closes the popover", async () => {
    const user = userEvent.setup();
    render(<ThemePicker />);
    await user.click(screen.getByRole("button", { name: /choose background theme/i }));
    const ruby = screen.getByRole("radio", { name: /ruby velvet/i });
    await user.click(ruby);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("ruby");
    expect(document.documentElement.getAttribute("data-theme")).toBe("ruby");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Escape closes the popover", async () => {
    const user = userEvent.setup();
    render(<ThemePicker />);
    await user.click(screen.getByRole("button", { name: /choose background theme/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
