import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2270 — The category × day-of-week heatmap renders `.stats-heatmap-row`
 * elements (one decorative head row plus per-category data rows). The
 * heatmap is a non-interactive presentational chart whose accessible
 * identity lives on the grid root (`data-testid="stats-cat-heatmap"`,
 * `role="img"`, `aria-label`); the rows themselves carry no focusable
 * controls. They therefore deliberately carry NO `tabindex` attribute —
 * adding `tabindex="0"` would inject a tab stop with no activation, and
 * `tabindex="-1"` would imply a programmatic focus target the page never
 * moves focus to. A sibling test (`StatsCatHeatmapNoTabindex`) pins the
 * grid root's tabindex absence, but no test currently pins the absence on
 * the row elements themselves. Lock that contract here so a refactor that
 * promotes any row to a focusable region fails fast and revisits the
 * keyboard model first.
 */
describe("StatsPage heatmap row tabindex absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2270: a `.stats-heatmap-row` element has no `tabindex` attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    const row = grid.querySelector(".stats-heatmap-row");
    expect(row).not.toBeNull();
    expect(row!.hasAttribute("tabindex")).toBe(false);
  });
});
