import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2770 — The category x day-of-week heatmap root is a static, purely
 * presentational chart announced as a single image (`role="img"` + literal
 * `aria-label`, W1250). The `aria-checked` state attribute is only valid
 * on a narrow set of checkable roles (checkbox, radio, menuitemcheckbox,
 * menuitemradio, switch, option, treeitem). Applying `aria-checked` to a
 * `role="img"` element is semantically meaningless and ARIA-spec-invalid:
 * screen readers may announce a phantom "checked/not checked" state on a
 * non-checkable visualization, confusing users who expect interactive
 * semantics.
 *
 * Already pinned on the same root: aria-label + role="img" (W1250),
 * aria-labelledby absence (W2019), aria-describedby absence (W2386),
 * aria-controls absence (W2650), aria-current absence, aria-pressed
 * absence (W2749 covers aria-selected). Pin the absence of `aria-checked`
 * here so a refactor that wraps the heatmap into a toggleable filter
 * widget or radio-style chart picker and naively forwards a checked-state
 * onto the img root fails loudly before shipping a regression in heatmap
 * screen-reader semantics.
 */
describe("StatsPage cat heatmap aria-checked absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2770: stats-cat-heatmap root has no aria-checked attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("aria-checked")).toBe(false);
  });
});
