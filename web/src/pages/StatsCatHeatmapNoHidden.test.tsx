import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2719 — The category × day-of-week heatmap chart root, identified by
 * `data-testid="stats-cat-heatmap"`, must be visible and discoverable
 * to assistive technology and to the layout pipeline at all times that
 * the StatsPage is mounted. The HTML `hidden` global attribute removes
 * the element from rendering AND from the accessibility tree (it is the
 * declarative equivalent of `display: none`), which would silently strip
 * the chart's `role="img"` + `aria-label` from screen readers and zero
 * out its layout box for sighted users. Visibility of this chart is not
 * a runtime concern — the chart is conditionally absent (not hidden)
 * when there is no data, and otherwise it is always rendered visibly.
 * Pin the absence of `hidden` on the heatmap root so a future refactor
 * that toggles visibility via the boolean `hidden` attribute (instead
 * of conditionally rendering or using a CSS-class state) fails here
 * before it ships and quietly breaks both the visual chart and its a11y
 * exposure on the Stats page.
 */
describe("StatsPage cat heatmap hidden absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2719: stats-cat-heatmap root has no hidden attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("hidden")).toBe(false);
  });
});
