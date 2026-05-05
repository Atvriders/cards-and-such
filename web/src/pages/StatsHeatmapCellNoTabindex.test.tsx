import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2269 — Sibling-test partner to W2231 (heatmap root tabindex absence) and
 * W1822 (cell role absence). Each `.stats-heatmap-cell` is a presentational
 * span used purely as a tinted swatch in the category × day-of-week heatmap.
 * Cells carry no click handler, no key handler, and no nested focusable
 * controls; their tooltip is exposed via the `title` attribute and their
 * value via visible text + `data-count`. Promoting them to focus stops with
 * `tabindex="0"` would dump 35 redundant tab stops into StatsPage with no
 * activation behaviour, while `tabindex="-1"` would imply a programmatic
 * focus target the page never moves focus to. Pin the absence of `tabindex`
 * on a sample data cell so a regression that adds keyboard focus targets
 * fails here and is forced to revisit the heatmap's keyboard model first.
 */
describe("StatsPage heatmap cell tabindex attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2269: stats-heatmap-cell has no tabindex attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // Sample one data cell — the tabindex-absence contract is uniform
    // across all 35 cells, so a single resolution is sufficient.
    const cell = screen.getByTestId("stats-cat-heatmap-solitaire-mon");
    // Sanity: confirm we resolved the data cell (not an unrelated sibling).
    // If this fails first, the data-testid contract changed — debug the
    // W1210 family before this one.
    expect(cell.classList.contains("stats-heatmap-cell")).toBe(true);
    // The actual contract: no tabindex attribute set at all. We use
    // `hasAttribute` (not `getAttribute() === null`) so a future stray
    // `tabindex=""` still trips this assertion.
    expect(cell.hasAttribute("tabindex")).toBe(false);
  });
});
