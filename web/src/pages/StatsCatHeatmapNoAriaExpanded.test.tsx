import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2772 — The category × day-of-week heatmap chart root, identified by
 * `data-testid="stats-cat-heatmap"`, is a static visualization (a
 * `role="img"` grid of numeric cells) — it is NOT a disclosure widget,
 * combobox, treeitem, or any other interactive control whose visible
 * content can be expanded or collapsed. Per ARIA, `aria-expanded` is only
 * meaningful on widgets that genuinely toggle child visibility (buttons,
 * links acting as disclosure triggers, comboboxes, treeitems, rows in a
 * grid that expand, etc.). Pinning `aria-expanded` onto the heatmap root
 * would (a) lie to assistive technologies by promising an expand/collapse
 * affordance that does not exist, (b) make screen readers announce a
 * spurious "collapsed"/"expanded" state on a static image, and (c) violate
 * the role contract for `role="img"`, which has no expanded-state
 * semantics. Pin the absence of `aria-expanded` on the heatmap root so a
 * future refactor that wires the chart into an unrelated
 * accordion/disclosure pattern (and accidentally forwards an
 * `aria-expanded` prop down to the grid) fails here before it ships and
 * silently degrades the accessibility tree.
 */
describe("StatsPage cat heatmap aria-expanded absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2772: stats-cat-heatmap root has no aria-expanded attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("aria-expanded")).toBe(false);
  });
});
