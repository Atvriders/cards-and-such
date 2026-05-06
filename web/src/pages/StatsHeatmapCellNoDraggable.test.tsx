import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2818 — Sibling-test partner to W2269 (cell tabindex absence), W2662
 * (cell aria-label absence), W2412 (cell aria-hidden absence), W1822 (cell
 * role absence), and W2065 (cell id absence). Each `.stats-heatmap-cell`
 * is a presentational <span> rendering an opacity-tinted swatch in the
 * category × day-of-week grid; the value is exposed through the `title`
 * tooltip and the visible numeric textContent. The cell is not a drag
 * source — there is no `onDragStart`, no `onDragEnd`, no parent drop zone,
 * and no part of the StatsPage participates in HTML5 drag-and-drop. A
 * regression that emitted `draggable` (or `draggable="true"`/`"false"`)
 * onto each cell would (a) opt the spans into the browser's drag-image
 * pipeline despite no handler ever firing, (b) leak a per-cell ghost
 * outline on long-press / mouse-down on touch devices and Firefox, and
 * (c) confuse assistive tech that surfaces draggable elements as
 * actionable. Existing cell tests pin tagName (W1422), text (W1403),
 * className (W1206), title (W1206/W1761), data-count (W1187/W1188),
 * id-absence (W2065), role-absence (W1822), tabindex-absence (W2269),
 * aria-hidden-absence (W2412), and aria-label-absence (W2662) but no test
 * pins the absence of the `draggable` attribute on a data cell. Pin it
 * here on a non-solitaire cell (cards-mon) so the contract is anchored
 * across more than one category bucket.
 */
describe("StatsPage heatmap cell draggable attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2818: stats-heatmap-cell has no draggable attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // Sample a non-solitaire data cell (cards-mon) — the draggable-absence
    // contract is uniform across all 35 cells, but anchoring on a separate
    // category bucket from the W2269/W2662 solitaire-mon samples spreads
    // the regression coverage across the HEATMAP_CATEGORIES axis.
    const cell = screen.getByTestId("stats-cat-heatmap-cards-mon");
    // Sanity: confirm we resolved the data cell (not an unrelated sibling).
    // If this fails first, the data-testid contract changed — debug the
    // W1210 family before this one.
    expect(cell.classList.contains("stats-heatmap-cell")).toBe(true);
    // The actual contract: no draggable attribute set at all. We use
    // `hasAttribute` (not `getAttribute() === null`) so a stray
    // `draggable=""` (which the HTML spec resolves to the "auto" state and
    // which triggers the same browser drag-image machinery) still trips
    // this assertion. The cell must not opt into the HTML5 drag pipeline.
    expect(cell.hasAttribute("draggable")).toBe(false);
  });
});
