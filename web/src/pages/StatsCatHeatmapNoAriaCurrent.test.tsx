import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2743 — The category x day-of-week heatmap chart root, identified by
 * `data-testid="stats-cat-heatmap"`, is a static data-visualization
 * container: it is not a navigable item within a set of related elements
 * (page, step, location, date, time) and it has no notion of "current"
 * selection. The ARIA `aria-current` attribute is defined for marking the
 * current item within a navigation landmark, breadcrumb trail, paginated
 * sequence, or similar discrete set — applying it to a chart root
 * misrepresents the element's semantics to assistive technology, can
 * confuse screen-reader users by suggesting a navigation context that
 * does not exist, and would force AT to announce "current" state on a
 * read-only visualization. Pin the absence of `aria-current` on the
 * heatmap root so a future refactor that auto-stamps navigation-style
 * ARIA attributes onto every page section (or that promotes the heatmap
 * card into a tabbed/paginated widget) fails here before it ships.
 */
describe("StatsPage cat heatmap aria-current absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2743: stats-cat-heatmap root has no aria-current attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("aria-current")).toBe(false);
  });
});
