import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1822 — Sibling-test partner to W1192 (cell className), W1206 (cell title),
 * W1210 (cell data-count), W1403 (cell visible numeric text), W1422 (cell
 * SPAN tag), and W1761 (cell title with zero count). Each heatmap data
 * cell is a presentational span that intentionally carries NO `role`
 * attribute — its semantics are inherited from the heatmap root's
 * `role="img"` / aria-label combo, and individual cells are exposed via
 * their `title` tooltip on hover. Adding `role="cell"`/`role="gridcell"`
 * would be incorrect (no enclosing `role="row"`/`role="grid"` ancestor)
 * and `role="button"` would be an outright lie (cells aren't activatable).
 * A regression that sprinkled an explicit role onto cells would still
 * leave className, data-count, title, opacity, data-testid, tag, and text
 * content intact while corrupting the a11y tree. Pin the absence of
 * `role` here.
 */
describe("StatsPage heatmap cell role attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1822: stats-heatmap-cell has no explicit role attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // Sample one data cell — the role-absence contract is uniform across
    // all 35 cells, so a single resolution is sufficient.
    const cell = screen.getByTestId("stats-cat-heatmap-solitaire-mon");
    // Sanity: confirm we resolved the data cell (not an unrelated sibling).
    // If this fails first, the data-testid contract changed — debug the
    // W1210 family before this one.
    expect(cell.classList.contains("stats-heatmap-cell")).toBe(true);
    // The actual contract: no role attribute set at all. We use
    // `hasAttribute` (not `getAttribute() === null`) so a future stray
    // `role=""` still trips this assertion.
    expect(cell.hasAttribute("role")).toBe(false);
  });
});
