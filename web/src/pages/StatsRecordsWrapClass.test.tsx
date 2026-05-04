import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1641 — Sibling-test partner to W1587 (cat-heatmap-card className equality),
 * W1601 (hour-of-day className equality), W1612 (this-week className
 * equality), W1622 (personal-records className equality), and W1631
 * (most-hinted className equality). The "Records" card is wrapped in
 * `<div className="stats-card stats-card--exportable" data-testid="stats-records">`
 * — the `--exportable` modifier toggles the export-affordance styling that
 * positions the SVG-export button (`stats-export-pie`) in the card's top-
 * right corner. Existing tests pin the wrapper's data-testid (W1305 reads
 * it to find the empty-state `<p>`; W1465 asserts the h2 parent has the
 * `stats-card` class via classList.contains; W-section-records-exportable
 * asserts both `stats-card` and `stats-card--exportable` via
 * classList.contains), but `classList.contains` allows additional modifier
 * classes to slip in undetected. A refactor that quietly added a third
 * modifier (e.g. `stats-card stats-card--exportable stats-card--wide` to
 * span 2 grid columns alongside the categories card, or
 * `stats-card stats-card--exportable stats-card--full` to grow the pie
 * chart) would re-flow the stats-card-grid layout — or worse, drop the
 * `--exportable` token entirely and silently disappear the export button —
 * without tripping any current assertion. Pin the exact className string
 * here so any silent modifier addition or removal fails loudly, forcing
 * the change to ship with an explicit visual-regression review.
 */
describe("StatsPage records card wrapper className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1641: stats-records wrapper has exact className 'stats-card stats-card--exportable' (no extra modifier)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-records");
    // Exact equality — not classList.contains — so an additional modifier
    // like `stats-card--wide`, `stats-card--full`, or a removal of the
    // load-bearing `stats-card--exportable` token is caught. Both the base
    // `stats-card` hook (CSS layout depends on it) and the `--exportable`
    // modifier (positions the SVG-export button absolutely in the top-right
    // corner) are required, in that order, to keep the records card
    // rendering identically to the categories card alongside it.
    expect(card.className).toBe("stats-card stats-card--exportable");
    // Belt-and-suspenders: the wrapper must also be a plain DIV, since
    // the stats-card-grid CSS rules target `.stats-card-grid > div`-shaped
    // children. A swap to <section>/<article> would re-trigger different
    // implicit ARIA roles inside the grid.
    expect(card.tagName).toBe("DIV");
  });
});
