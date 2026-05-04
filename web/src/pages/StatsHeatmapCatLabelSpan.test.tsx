import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1364 — Sibling-test partner to W1210 (5 data rows + ordered category
 * labels), W1278 (row container DIV), and W1341 (head row spacer span). Each
 * data row in the category × day-of-week heatmap leads with a per-row
 * category label rendered as `<span className="stats-heatmap-cat">{cat}</span>`.
 * That label is the sole left-column hook a sighted user has for telling the
 * five rows apart, but no test currently pins the element TAG of the data-row
 * label. W1210 selects via the `.stats-heatmap-cat` className and asserts the
 * ordered text content, W1341 pins the head row's empty spacer span, and
 * W1278 pins the row container — but a refactor that promoted the per-row
 * label to a `<div>`, `<th>`, `<label>`, or `<p>` would silently change the
 * inline-flow layout (spans participate in the CSS grid as inline children
 * with no implicit role; divs/headings would inject block-level boxes and
 * implicit ARIA roles that fight the root `role="img"`) with every existing
 * assertion still passing. Pin the SPAN tag here on every data-row label so
 * any such promotion fails loudly at the row that was changed.
 */
describe("StatsPage heatmap data-row category label element type", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1364: stats-heatmap-cat per-row category label is a SPAN element on every data row", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    // Filter out the head row (W1198/W1341 own its empty spacer span) so we
    // only inspect the labels on the 5 data rows.
    const dataRows = Array.from(
      grid.querySelectorAll(".stats-heatmap-row"),
    ).filter((r) => !r.classList.contains("stats-heatmap-row--head"));
    expect(dataRows.length).toBe(5);

    for (const row of dataRows) {
      const label = row.querySelector(".stats-heatmap-cat");
      expect(label).not.toBeNull();
      // Lock the tag to SPAN so a swap to <div>/<th>/<label>/<p> trips here.
      expect(label!.tagName).toBe("SPAN");
    }
  });
});
