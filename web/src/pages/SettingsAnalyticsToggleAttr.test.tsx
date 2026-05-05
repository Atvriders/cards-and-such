import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock platform sounds so SettingsPage doesn't poke Web Audio in jsdom —
// matches the sibling SettingsAnalyticsToggleType / SettingsAnalyticsToggleClass
// setup so module resolution stays identical (otherwise unrelated exports
// can tree-shake out).
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

// W1898: the analytics panel toggle is rendered as a real <button> element
// — NOT an <a>, NOT a <div role="button">, NOT an <input type="button">.
// The sibling SettingsAnalyticsToggleType test pins type="button" and the
// SettingsAnalyticsToggleClass test pins the "settings-link
// settings-link--inline" className pair. Together those two tests describe
// what a *button-shaped* element should expose, but neither one pins the
// host element's actual tagName. That gap matters because the className
// "settings-link" hints at a text-link visual treatment — a refactor could
// reasonably "fix" the markup to use an <a> (which would silently change
// keyboard activation, focus styling, and would no longer respect the
// type="button" attribute since <a> ignores it) and every existing test
// would still pass. Pin the literal tagName here so any swap to a non-
// <button> host is forced through an explicit decision.
describe("SettingsPage analytics panel toggle host element tagName (W1898)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Module-scoped ring buffer — wipe before mount so any pre-existing
    // events can't influence the toggle's render path.
    clearEvents();
  });

  it("renders the analytics toggle as a literal <button> element", () => {
    renderPage();

    const toggle = screen.getByTestId("analytics-toggle");
    // tagName is uppercase in HTML documents (jsdom matches the spec).
    // Asserting against the uppercase form is the canonical pattern used
    // by sibling Settings analytics tests (RowCode, RowClass, ListTag).
    expect(toggle.tagName).toBe("BUTTON");
  });
});
