import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2762 — The category × day-of-week heatmap root is a static, purely
 * presentational chart announced to assistive tech as a single image via
 * `role="img"` + the literal `aria-label` (W1250). `aria-orientation` is
 * defined for composite/interactive widget roles such as scrollbar, slider,
 * separator, tablist, toolbar, listbox, menu, menubar, radiogroup, tree,
 * and treegrid — it has no defined semantics on `role="img"`. Layering an
 * `aria-orientation` value (horizontal/vertical) onto an image-role element
 * either gets ignored by conformant ATs (noise in the DOM, contradictory
 * intent) or, on lenient ATs, falsely advertises that the heatmap is an
 * orientable composite widget that can be navigated with arrow keys along
 * a primary axis — neither of which is true here.
 *
 * Already pinned on the same root: aria-label + role="img" (W1250),
 * aria-labelledby absence (W2019), aria-describedby absence (W2386),
 * aria-controls absence (W2650). Pin the absence of `aria-orientation`
 * here so a refactor that copies attributes from a real toolbar/tablist
 * (or speculatively annotates the heatmap as a "horizontal" grid) fails
 * loudly before shipping a regression in heatmap screen-reader semantics.
 */
describe("StatsPage cat heatmap aria-orientation absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2762: stats-cat-heatmap root has no aria-orientation attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("aria-orientation")).toBe(false);
  });
});
