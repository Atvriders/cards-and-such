import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2650 — The category × day-of-week heatmap root is a static, purely
 * presentational chart: it announces itself as a single image to assistive
 * tech via `role="img"` + the literal `aria-label` (W1250) and exposes
 * per-cell tooltips via `title` for sighted hover. It does NOT control any
 * other widget — there is no disclosure target, no popup, no listbox, no
 * tabpanel, no other element whose state/visibility is steered by this
 * heatmap. Layering an `aria-controls` reference onto the root would
 * either point at a non-existent id (silently breaking the AT relationship
 * graph) or falsely advertise a controller relationship that doesn't
 * exist, polluting screen-reader navigation with a phantom controlled
 * region.
 *
 * Already pinned on the same root: aria-label + role="img" (W1250),
 * aria-labelledby absence (W2019), aria-describedby absence (W2386). Pin
 * the absence of `aria-controls` here so a refactor that wires the
 * heatmap up to drive a sibling panel (or copies an aria-controls value
 * over from a real chart toggle) fails loudly before shipping a
 * regression in heatmap screen-reader semantics.
 */
describe("StatsPage cat heatmap aria-controls absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2650: stats-cat-heatmap root has no aria-controls attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("aria-controls")).toBe(false);
  });
});
