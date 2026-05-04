import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1576 — Sibling-test partner to W1210 (5 data rows + ordered category
 * labels), W1278 (row container DIV tag), W1341 (head row 1+7 child layout),
 * W1369 (label firstElementChild position), W1422 (cell SPAN tag), and
 * W1440 (label leaf shape). The category × day-of-week heatmap is laid out
 * as a 1+7 CSS grid: every DATA row must have exactly 8 element children —
 * a leading `.stats-heatmap-cat` label followed by seven
 * `.stats-heatmap-cell` boxes for Mon..Sun. W1341 pins the head row's 1+7
 * shape (spacer + 7 dow labels) but no existing test pins the equivalent
 * count on the DATA rows. A refactor that injected an extra spacer cell
 * (e.g. a trailing "row total" badge), wrapped the seven cells in an inner
 * `<div>` (collapsing the row to 2 children: label + wrapper), or dropped a
 * day column (e.g. weekend-only) would leave W1369/W1422/W1440's
 * tag/class/leaf assertions intact while silently breaking the 1+7 grid
 * column allocation — Mon..Sun cells would no longer line up under the head
 * row's day labels. Pin `childElementCount === 8` on every data row here so
 * any such structural drift fails loudly on the row that was changed.
 */
describe("StatsPage heatmap data-row child count", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1576: every stats-heatmap-row data row has exactly 8 element children (1 cat label + 7 day cells)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    // Exclude the decorative head row (W1341 owns its 1+7 shape) so we only
    // inspect the 5 data rows.
    const dataRows = Array.from(
      grid.querySelectorAll(".stats-heatmap-row"),
    ).filter((r) => !r.classList.contains("stats-heatmap-row--head"));
    expect(dataRows.length).toBe(5);

    for (const row of dataRows) {
      // Lock the 1+7 grid: exactly 8 element children. An extra spacer/badge
      // would push above 8; a wrapper around the cells would collapse to 2;
      // a dropped day column would drop to 7. All must fail here.
      expect(row.childElementCount).toBe(8);
      // Belt-and-suspenders: of those 8 children, the first must be the
      // category label and the remaining 7 must be the day cells. Any class
      // re-allocation across the 8 slots would surface here even if the
      // total count happens to coincide.
      const labels = row.querySelectorAll(":scope > .stats-heatmap-cat");
      expect(labels.length).toBe(1);
      const cells = row.querySelectorAll(":scope > .stats-heatmap-cell");
      expect(cells.length).toBe(7);
    }
  });
});
