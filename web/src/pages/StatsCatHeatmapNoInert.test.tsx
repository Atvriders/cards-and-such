import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2808 — The category × day-of-week heatmap chart's grid root, identified
 * by `data-testid="stats-cat-heatmap"`, is a static, always-interactive
 * data-visualization region. It contains no focusable descendants that
 * should ever be excluded from sequential focus navigation, the
 * accessibility tree, or pointer interaction at this scope. The HTML
 * `inert` attribute would do exactly that: when present on an element it
 * removes the entire subtree from the tab order, blocks click/pointer
 * events, and hides the subtree from assistive technology — turning a
 * legitimate, screen-reader-exposed (`role="img"` + `aria-label`, pinned by
 * W1250) data region into an unreachable, silent block of DOM. A refactor
 * that conditionally toggles `inert` onto the heatmap root — for instance,
 * to "disable" it during a drill-down panel open state, during a reset
 * confirmation modal, or while data is reloading — would regress the
 * accessibility contract pinned by the W2652 (no aria-busy), W2386 (no
 * aria-describedby), W2019 (no aria-labelledby), W2106 (no inline style),
 * and surrounding aria-* absence tests, all of which assume the grid is a
 * plain, always-live img-role element. None of those existing pins observe
 * the `inert` attribute, so a stray `inert` (or `inert={someFlag}`) on the
 * root would slip through every current test while breaking keyboard
 * users, screen-reader users, and pointer users simultaneously. Pin the
 * absence of `inert` on the heatmap root so that drift fails here before
 * it ships.
 */
describe("StatsPage cat heatmap inert absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2808: stats-cat-heatmap root has no inert attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("inert")).toBe(false);
  });
});
