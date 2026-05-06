import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2824 — The category x day-of-week heatmap grid on StatsPage is a static
 * chart: it renders its 35 cell intensities (5 categories x 7 days, last 30
 * days) once per render from in-memory `localStorage` data, with no live
 * region semantics, no polling, no streamed updates, and no follow-up DOM
 * mutations after mount. Companion W2652/W2386/W2419 etc. coverage already
 * pins the affirmative role="img"/aria-label contract and the absence of
 * other ARIA live-region attributes (aria-busy, aria-relevant, etc.), but
 * NOTHING pins the absence of `aria-atomic`.
 *
 * `aria-atomic` is meaningful only on a live region (an element with an
 * implicit or explicit `aria-live` / role="status" / role="alert"
 * association). Adding `aria-atomic="true"` to this static `role="img"`
 * grid would either be silently ignored (best case) or, in browsers/AT
 * pairs that hoist atomicity onto an ancestor live region, cause the
 * entire 35-cell heatmap to be re-announced as a single chunk every time
 * any sibling region updates - a catastrophic verbosity regression for
 * screen-reader users on the Stats page. Pin the absence of `aria-atomic`
 * on the heatmap root so a future refactor that blanket-applies live
 * region attributes (e.g. wrapping all charts in a polite-announce
 * helper) fails here before it ships.
 */
describe("StatsPage cat heatmap aria-atomic absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2824: stats-cat-heatmap root has no aria-atomic attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("aria-atomic")).toBe(false);
  });
});
