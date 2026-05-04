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

// W1351: the analytics panel toggle must carry an explicit type="button".
// Without it, React renders the default <button> type which submits enclosing
// forms — and while SettingsPage doesn't currently wrap this control in a
// <form>, omitting the attribute would silently regress that protection if a
// future refactor moved the panel under one. Existing tests cover the
// toggle's aria-expanded + label flips, but no test pins the form-safety
// guarantee, so a rename or removal of the attribute would slip through.
describe("SettingsPage analytics panel toggle button type (W1351)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Module-scoped ring buffer — wipe before mount so any pre-existing
    // events can't influence the toggle's render path.
    clearEvents();
  });

  it("renders the analytics toggle with an explicit type=button attribute", () => {
    renderPage();

    const toggle = screen.getByTestId("analytics-toggle");
    // Use getAttribute, not the .type DOM property — the latter coerces
    // missing/invalid values to "submit", which would mask the regression
    // we're guarding against. We want the *literal* attribute on the markup.
    expect(toggle.getAttribute("type")).toBe("button");
  });
});
