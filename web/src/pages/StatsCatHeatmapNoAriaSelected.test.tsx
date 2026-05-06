import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2749 — The category × day-of-week heatmap root is a static, purely
 * presentational chart announced as a single image (`role="img"` + literal
 * `aria-label`, W1250). It is not part of any selection widget: it isn't
 * an `option` inside a `listbox`, a `tab` inside a `tablist`, a row in a
 * selectable `grid`, nor a `gridcell` whose selection state should be
 * advertised. The `aria-selected` state attribute is only meaningful on a
 * narrow set of selectable roles, and applying it to `role="img"` is both
 * semantically incorrect (screen readers may announce a phantom
 * "selected/not selected" state on a non-selectable visualization) and
 * a violation of the ARIA spec's allowed-attribute matrix for img.
 *
 * Already pinned on the same root: aria-label + role="img" (W1250),
 * aria-labelledby absence (W2019), aria-describedby absence (W2386),
 * aria-controls absence (W2650), aria-current absence, aria-pressed
 * absence, aria-disabled absence, aria-busy absence, aria-relevant
 * absence, aria-roledescription absence. Pin the absence of
 * `aria-selected` here so a refactor that drops the heatmap into a
 * selectable container (chart picker, tabbed dashboard, multi-select
 * filter grid) and naively forwards selection state onto the img root
 * fails loudly before shipping a regression in heatmap screen-reader
 * semantics.
 */
describe("StatsPage cat heatmap aria-selected absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2749: stats-cat-heatmap root has no aria-selected attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("aria-selected")).toBe(false);
  });
});
