import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1612 — Sibling-test partner to W1587 (cat-heatmap-card className equality)
 * and W1601 (hour-of-day className equality). The "This week" card is
 * wrapped in `<div className="stats-card stats-card--week"
 * data-testid="stats-this-week">` — the `--week` modifier is the styling
 * hook that differentiates the delta-row, prior-week-list layout from the
 * generic single-column stats cards (W1226 pins the modifier presence via
 * `classList.contains`). But `classList.contains` allows additional
 * modifier classes to slip in undetected: a refactor that quietly added
 * `stats-card--wide` (to span 2 grid columns mirroring the activity card),
 * `stats-card--exportable` (to add a CSV/PNG export affordance mirroring
 * the records cards), or renamed `--week` to `--week-summary` while
 * keeping the contains-check passing for `stats-card` would re-flow the
 * stats-card-grid layout, break the week-card-specific CSS rules, or
 * render a non-functional export button — without tripping any current
 * assertion. Pin the exact className string here so any silent modifier
 * addition, removal, or rename fails loudly, forcing the change to ship
 * with an explicit visual-regression review.
 */
describe("StatsPage this-week card wrapper className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1612: stats-this-week wrapper has exact className 'stats-card stats-card--week' (no extra modifier)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    // Exact equality — not classList.contains — so an additional modifier
    // like `stats-card--wide`, `stats-card--exportable`, or `stats-card--full`
    // is caught. The `--week` modifier is required (the week-specific
    // delta/prior-week styles hang off it), and the absence of any further
    // modifier is the deliberate choice that keeps the week card sized
    // like the other single-column stats cards.
    expect(card.className).toBe("stats-card stats-card--week");
    // Belt-and-suspenders: the wrapper must also be a plain DIV, since
    // the stats-card-grid CSS rules target `.stats-card-grid > div`-shaped
    // children. A swap to <section>/<article> would re-trigger different
    // implicit ARIA roles inside the grid.
    expect(card.tagName).toBe("DIV");
  });
});
