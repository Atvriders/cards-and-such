import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1369 — Sibling-test partner to W1210 (5 data rows + ordered category
 * labels), W1278 (row container DIV), W1341 (head row leading spacer span),
 * and W1364 (data-row label SPAN tag). The category × day-of-week heatmap
 * is laid out as a 1+7 CSS grid: each data row leads with a
 * `.stats-heatmap-cat` category label that occupies the gutter column,
 * followed by seven `.stats-heatmap-cell` boxes for Mon..Sun. W1341 already
 * asserts the head row's leading spacer is `firstElementChild`, but no
 * existing test pins that the per-row category label is also the
 * `firstElementChild` of each DATA row. A refactor that re-orders children
 * (e.g. moving the label to the row's end as a "right gutter", or wrapping
 * the seven cells in an inner div with the label appended after) would
 * leave W1210/W1364's class+tag+text assertions intact while silently
 * shifting every cell one column right under the wrong day-of-week header
 * — Mon plays would now render under the category-label gutter, Sun would
 * overhang. Pin the data-row label's leading position here so any such
 * re-order trips loudly on every data row.
 */
describe("StatsPage heatmap data-row category label position", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1369: stats-heatmap-cat label is firstElementChild of every data row, preceding the cells", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    // Exclude the decorative head row (W1341 owns its leading spacer's
    // position) so we only inspect the 5 data rows.
    const dataRows = Array.from(
      grid.querySelectorAll(".stats-heatmap-row"),
    ).filter((r) => !r.classList.contains("stats-heatmap-row--head"));
    expect(dataRows.length).toBe(5);

    for (const row of dataRows) {
      const first = row.firstElementChild as HTMLElement | null;
      expect(first).not.toBeNull();
      // The leading child must be the `.stats-heatmap-cat` category label
      // (not a cell, not an inserted wrapper) so the gutter column lines
      // up with the head row's spacer above.
      expect(first!.classList.contains("stats-heatmap-cat")).toBe(true);
      // And its immediate next sibling must be the first cell of the row
      // (Mon column) — locks the label-then-cells order so a swap to
      // cells-then-label would fail here.
      const next = first!.nextElementSibling as HTMLElement | null;
      expect(next).not.toBeNull();
      expect(next!.classList.contains("stats-heatmap-cell")).toBe(true);
    }
  });
});
