import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2792 — The category x day-of-week heatmap root
 * (`data-testid="stats-cat-heatmap"`) is a static, read-only data
 * visualization that advertises itself as a single image to assistive
 * tech via `role="img"` + a literal `aria-label` (W1250). The
 * `aria-readonly` attribute is reserved for editable widgets (textbox,
 * combobox, grid, listbox, etc.) to indicate the user cannot modify
 * their value while still being focusable — applying it to a
 * non-editable `role="img"` visualization would either be ignored as
 * an invalid attribute/role pairing or, worse, mislead screen readers
 * into announcing the chart as a disabled-but-editable form control.
 *
 * Already pinned on the same root: aria-label + role="img" (W1250),
 * aria-labelledby absence (W2019), aria-describedby absence (W2386),
 * aria-controls absence (W2650), aria-current absence (W2743),
 * aria-pressed absence (W2747), aria-selected absence (W2749),
 * aria-haspopup absence (W2764), aria-checked absence (W2770), lang
 * absence (W2692), style absence (W2106). Pin the absence of
 * `aria-readonly` here so a refactor that copies an editable-grid
 * attribute set onto the heatmap (or treats it as an interactive
 * editable widget) fails loudly before shipping a regression in
 * heatmap screen-reader semantics.
 */
describe("StatsPage cat heatmap aria-readonly absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2792: stats-cat-heatmap root has no aria-readonly attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("aria-readonly")).toBe(false);
  });
});
