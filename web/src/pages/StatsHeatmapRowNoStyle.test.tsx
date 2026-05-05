import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2126 — The category × day-of-week heatmap renders six `.stats-heatmap-row`
 * elements (one decorative head row + five category data rows). None of them
 * carry an inline `style` attribute today: visual concerns (grid layout, gaps,
 * row heights, dividers) live entirely in stylesheets, while the only
 * dynamic visual signal — per-cell heat opacity — is applied to the
 * `.stats-heatmap-cell` descendants, not to the row containers. Sibling tests
 * already pin row-level absence of `id`, `aria-hidden` (on data rows),
 * `role`, and `title`, but no test guards the absence of an inline `style`.
 * Pinning `style` absence prevents row-level inline styling from sneaking in
 * during refactors (e.g. accidentally hoisting cell-level opacity, gap, or
 * grid-template overrides up to the row), which would (a) bypass the
 * stylesheet-driven theming contract, (b) make per-row heat values harder to
 * reason about for screen-reader users walking the grid, and (c) raise CSP
 * `style-src` friction in environments that disallow inline style attributes.
 */
describe("StatsPage heatmap rows style attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2126: every .stats-heatmap-row element has no inline `style` attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    const allRows = Array.from(grid.querySelectorAll(".stats-heatmap-row"));
    // 1 head row + 5 category data rows.
    expect(allRows.length).toBe(6);
    for (const row of allRows) {
      expect(row.hasAttribute("style")).toBe(false);
    }
  });
});
