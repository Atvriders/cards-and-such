import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock platform sounds so SettingsPage doesn't poke Web Audio in jsdom —
// matches the sibling SettingsPage.test.tsx setup so module resolution
// stays identical (otherwise other exports would tree-shake out).
vi.mock("../platform/sounds.js", async () => {
  const actual = await vi.importActual<typeof import("../platform/sounds.js")>(
    "../platform/sounds.js",
  );
  return { ...actual, playSound: vi.fn() };
});

import SettingsPage from "./SettingsPage.js";
import { clearEvents } from "../platform/analytics.js";

function renderPage(): void {
  render(
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>,
  );
}

// W1557: the analytics panel toggle is styled as a quiet inline text link
// (de-emphasized so casual users never notice it) by way of the
// "settings-link settings-link--inline" className pair. The "--inline"
// modifier is what trims the button's vertical padding so it sits flush
// inside the surrounding settings-mini-row. Existing tests cover the
// toggle's type, aria-expanded, and label flip, but none pin the visual
// className contract, so a refactor to a regular settings-mini-btn would
// silently change the appearance without test failures.
describe("SettingsPage analytics panel toggle className (W1557)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Module-scoped ring buffer — wipe before mount so any pre-existing
    // events can't influence the toggle's render path.
    clearEvents();
  });

  it("renders the analytics toggle with the inline settings-link className pair", () => {
    renderPage();

    const toggle = screen.getByTestId("analytics-toggle");
    // Both classes must be present — "settings-link" is the base text-link
    // styling and "settings-link--inline" is the modifier that keeps it
    // sitting flush in the row. classList.contains avoids order-coupling so
    // a future re-ordering of the className string still passes.
    expect(toggle.classList.contains("settings-link")).toBe(true);
    expect(toggle.classList.contains("settings-link--inline")).toBe(true);
  });
});
