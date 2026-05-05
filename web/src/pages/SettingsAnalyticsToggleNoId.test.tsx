import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock platform sounds so SettingsPage doesn't poke Web Audio in jsdom —
// matches the sibling SettingsAnalyticsToggleAttr / SettingsAnalyticsToggleType /
// SettingsAnalyticsToggleClass / SettingsAnalyticsToggleNoTabindex setup so
// module resolution stays identical (otherwise unrelated exports can
// tree-shake out).
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

// W2411: the analytics panel toggle ("Show event log" / "Hide event log")
// is addressed exclusively by its data-testid="analytics-toggle" hook —
// nothing in the app, nor any sibling test, relies on a DOM `id`. Sibling
// tests pin its tagName (Attr), type="button" (Type), className contract
// (Class), and the absence of tabindex (NoTabindex / W2330). None of them
// guard against a future regression that bolts an `id` onto this button
// (e.g. someone adding `id="analytics-toggle"` to mirror the testid, or a
// label-for ↔ id wiring being mis-applied here). An unintended `id` would
// pollute the global id namespace, risk colliding with another element on
// the same page, and quietly create a second handle that bypasses the
// canonical testid contract. Pin the attribute's *absence* so that
// contract holds.
describe("SettingsPage analytics-toggle button has no id (W2411)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Module-scoped ring buffer — wipe before mount so any pre-existing
    // events can't influence the toggle's render path.
    clearEvents();
  });

  it("renders analytics-toggle without an id attribute", () => {
    renderPage();

    const btn = screen.getByTestId("analytics-toggle");
    // Use hasAttribute rather than reading .id — the DOM property
    // coerces a missing attribute to "" which would *also* be falsy
    // for an accidentally-set id="" empty string. We want strict
    // attribute absence so the regression surface is unambiguous.
    expect(btn.hasAttribute("id")).toBe(false);
  });
});
