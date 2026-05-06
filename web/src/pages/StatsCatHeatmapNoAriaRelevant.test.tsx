import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2688 — The category x day-of-week heatmap on StatsPage is a static
 * `role="img"` summary that is fully painted on first render. W2652 already
 * pins the absence of `aria-busy` on this element; this test pins the
 * absence of the sibling live-region attribute `aria-relevant`.
 *
 * `aria-relevant` is only meaningful on an aria-live region: it tells AT
 * which kinds of subtree mutations (additions/removals/text/all) should be
 * announced when the live region updates. The heatmap is NOT a live region
 * (no `aria-live`, and W2652 confirms no `aria-busy`), so attaching
 * `aria-relevant` to it would be either inert noise (ignored by AT, but
 * misleading to anyone reading the DOM/auditing a11y) or — if a future
 * refactor wires the heatmap into a live-region wrapper — would silently
 * start announcing every cell mutation as the 30-day window slides forward
 * each day, drowning the user in chatter.
 *
 * Pin `aria-relevant` absence so accidental introduction of live-region
 * semantics on this static chart fails here before it ships.
 */
describe("StatsPage cat heatmap aria-relevant absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2688: stats-cat-heatmap root has no aria-relevant attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("aria-relevant")).toBe(false);
  });
});
