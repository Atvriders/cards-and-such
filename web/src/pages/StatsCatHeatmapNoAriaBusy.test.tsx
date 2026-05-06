import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2652 — The category × day-of-week heatmap grid is the StatsPage chart that
 * recomputes its 35 cell intensities (5 categories × 7 days, last 30 days)
 * synchronously from `localStorage` on every render. Because the data is
 * already in memory by the time StatsPage mounts (no fetch, no async
 * hydration, no Suspense boundary), the grid is ALWAYS settled the moment
 * it appears in the DOM — there is no in-flight state to communicate to
 * assistive tech. Existing W1250/W2386/W2419 coverage pins the affirmative
 * a11y contract on this element (role="img", aria-label, no
 * aria-describedby/aria-labelledby), and W2106/W2001/W1995 pin the absence
 * of style/id/tabindex, but NOTHING pins the absence of `aria-busy`.
 *
 * `aria-busy="true"` would be a lie: it tells screen readers "this region
 * is being updated, ignore it for now," which is exactly wrong for a chart
 * whose data is already final. A future refactor that wires the heatmap
 * into a generic loading-aware wrapper (e.g. one that drops `aria-busy`
 * from a parent `useDeferredValue` / Suspense fallback onto every
 * `role="img"` child) would silently start announcing the heatmap as busy
 * even though it has nothing to load. Pin the absence of `aria-busy` on
 * the grid root so that announcement-drift fails here before it ships and
 * confuses every assistive-tech user opening the Stats page.
 */
describe("StatsPage cat heatmap aria-busy absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2652: stats-cat-heatmap root has no aria-busy attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("aria-busy")).toBe(false);
  });
});
