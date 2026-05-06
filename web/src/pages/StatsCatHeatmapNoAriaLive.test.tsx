import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2826 — The category x day-of-week heatmap root
 * (`data-testid="stats-cat-heatmap"`) is a static, purely presentational
 * chart announced as a single image (`role="img"` + literal `aria-label`,
 * W1250). It is rendered once per StatsPage mount from already-loaded
 * session history; its DOM does not mutate in response to live user
 * activity, async fetches, or polling — there is no live region semantic
 * to advertise.
 *
 * `aria-live` marks an element as a live region whose subtree updates
 * should be announced to assistive tech as they happen ("polite" or
 * "assertive"). Attaching it to a non-mutating `role="img"` chart root
 * would (a) misrepresent the heatmap as a streaming/announcing surface,
 * (b) couple downstream `aria-relevant` / `aria-busy` semantics that the
 * codebase has explicitly pinned absent (W2688, W2652), and (c) risk
 * verbose, repeated screen-reader chatter on re-render even when no
 * meaningful change occurred.
 *
 * Already pinned on the same root: role="img" + aria-label (W1250),
 * aria-labelledby/describedby/controls/current absence, aria-checked
 * (W2770), aria-pressed/selected/expanded/disabled/readonly/required/
 * orientation/multiselectable/haspopup/relevant/role-description/busy/
 * keyshortcuts absences. Pin the absence of `aria-live` so a future
 * refactor that wires periodic refresh of the heatmap and naively marks
 * the img root as a live region (instead of announcing the actual
 * delta via a separate visually-hidden status node) fails loudly before
 * shipping a screen-reader regression.
 */
describe("StatsPage cat heatmap aria-live absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2826: stats-cat-heatmap root has no aria-live attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("aria-live")).toBe(false);
  });
});
