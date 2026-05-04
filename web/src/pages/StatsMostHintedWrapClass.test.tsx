import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1631 — Sibling-test partner to W1587 (cat-heatmap-card className equality),
 * W1601 (hour-of-day className equality), W1612 (this-week className
 * equality), and W1622 (personal-records className equality). The
 * "Most-hinted puzzles" card is wrapped in a plain
 * `<div className="stats-card" data-testid="stats-most-hinted">` — with
 * NO width/variant modifier (unlike the adjacent
 * `stats-card stats-card--week` "this week" card whose `--week` modifier
 * adds responsive width tweaks, and unlike the
 * `stats-card stats-card--exportable` activity/records/categories cards
 * whose `--exportable` modifier toggles export-affordance styling).
 * Existing tests pin the wrapper's data-testid (W1488 asserts the h2
 * parent's `data-testid` is `stats-most-hinted`) and the
 * `stats-most-hinted-rank`/`stats-most-hinted-title`/`stats-most-hinted-count`
 * leaf classNames, but no test pins the wrapper's exact className string.
 * A refactor that quietly added a modifier (e.g.
 * `stats-card stats-card--exportable` to add a CSV/JSON export button
 * mirroring the activity card, or `stats-card stats-card--wide` to span 2
 * grid columns alongside the personal-records-by-category list) would
 * re-flow the stats-card-grid layout — or worse, render a non-functional
 * export button — without tripping any current assertion. Pin the exact
 * className string here so any silent modifier addition fails loudly,
 * forcing the change to ship with an explicit visual-regression review.
 */
describe("StatsPage most-hinted card wrapper className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1631: stats-most-hinted wrapper has exact className 'stats-card' (no width/variant modifier)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-most-hinted");
    // Exact equality — not classList.contains — so an additional modifier
    // like `stats-card--wide`, `stats-card--exportable`, or
    // `stats-card--full` is caught. The base `stats-card` hook is required
    // (CSS layout depends on it), and the absence of any modifier is the
    // deliberate choice that keeps the most-hinted card sized like the
    // other single-column stats cards.
    expect(card.className).toBe("stats-card");
    // Belt-and-suspenders: the wrapper must also be a plain DIV, since
    // the stats-card-grid CSS rules target `.stats-card-grid > div`-shaped
    // children. A swap to <section>/<article> would re-trigger different
    // implicit ARIA roles inside the grid.
    expect(card.tagName).toBe("DIV");
  });
});
