import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock platform sounds so SettingsPage doesn't poke Web Audio in jsdom —
// matches the sibling SettingsAnalyticsToggleAttr / SettingsAnalyticsToggleType /
// SettingsAnalyticsToggleClass setup so module resolution stays identical
// (otherwise unrelated exports can tree-shake out).
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

// W2330: the analytics panel toggle ("Show event log" / "Hide event log")
// is a real <button> rendered inline in the Data section's normal document
// flow, so it must rely on the browser's intrinsic tab order — no explicit
// `tabindex` attribute. Sibling tests pin its tagName (W1898 - Attr),
// type="button" (Type), and className contract (Class), but none guard
// against a future regression that adds a stray tabindex. A reflexive
// tabindex="0" would duplicate the natural tab stop, and a tabindex="-1"
// (e.g. added to "hide" the dev-only link from keyboard users) would
// silently strip keyboard reachability for power users / maintainers who
// rely on this surface to inspect the local-only analytics ring buffer.
// Pin the attribute's *absence* so that contract holds.
describe("SettingsPage analytics-toggle button has no tabindex (W2330)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Module-scoped ring buffer — wipe before mount so any pre-existing
    // events can't influence the toggle's render path.
    clearEvents();
  });

  it("renders analytics-toggle without a tabindex attribute", () => {
    renderPage();

    const btn = screen.getByTestId("analytics-toggle");
    // Use hasAttribute, not the .tabIndex DOM property — the latter
    // coerces a missing attribute to 0 for focusable elements, which
    // would mask the regression we guard against.
    expect(btn.hasAttribute("tabindex")).toBe(false);
  });
});
