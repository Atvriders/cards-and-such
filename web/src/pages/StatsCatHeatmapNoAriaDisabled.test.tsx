import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2656 — The category x day-of-week heatmap root is a static,
 * read-only data visualization: it exposes itself to assistive tech as a
 * single image (role="img" + aria-label, W1250) with per-cell tooltips
 * via `title` for sighted hover. It is not a focusable, interactive
 * widget — there is no button, link, menuitem, option, tab, checkbox,
 * radio, or form control role on the root, and no keyboard activation
 * behavior. The `aria-disabled` state is only meaningful on widgets
 * whose interactive affordance can be turned off; layering it onto a
 * presentational chart root would either advertise a phantom
 * "disabled" interactive widget to screen readers (polluting the AT
 * tree with a non-existent control state) or, on AT that surfaces
 * `aria-disabled="false"` as "available", falsely imply an enabled
 * actionable element where none exists.
 *
 * Already pinned on the same root: aria-label + role="img" (W1250),
 * aria-labelledby absence (W2019), aria-describedby absence (W2386),
 * aria-controls absence (W2650), no inline style (W2106). Pin the
 * absence of `aria-disabled` here so a refactor that mistakenly
 * threads a generic "disabled when no data" state attribute across
 * stats cards (or copies aria-disabled over from a sibling control)
 * fails loudly before shipping a regression in heatmap screen-reader
 * semantics.
 */
describe("StatsPage cat heatmap aria-disabled absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2656: stats-cat-heatmap root has no aria-disabled attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("aria-disabled")).toBe(false);
  });
});
