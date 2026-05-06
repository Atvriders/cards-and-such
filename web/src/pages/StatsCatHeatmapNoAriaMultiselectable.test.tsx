import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2782 — The category x day-of-week heatmap chart root, identified by
 * `data-testid="stats-cat-heatmap"`, is a pure data-visualization element
 * exposed to assistive technology with `role="img"` and a static
 * `aria-label` describing the chart. It is NOT a `listbox`, `tablist`,
 * `tree`, `grid`, or any other ARIA composite-selection container. The
 * `aria-multiselectable` attribute is only meaningful for those
 * selection-supporting roles — applying it to a non-selectable image
 * misleads assistive technology into announcing selectable semantics
 * that the heatmap does not (and should not) support, and adds a
 * useless serialized attribute to every render.
 *
 * This test pins the absence of `aria-multiselectable` on the heatmap
 * root so that any future refactor that blindly stamps composite-widget
 * ARIA attributes onto chart containers (e.g., a generic "interactive
 * grid" wrapper or a copy-paste from a real listbox) fails here before
 * it ships.
 *
 * The pin: `grid.hasAttribute("aria-multiselectable") === false`.
 */
describe("StatsPage cat heatmap aria-multiselectable absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2782: stats-cat-heatmap root has no aria-multiselectable attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("aria-multiselectable")).toBe(false);
  });
});
