import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2764 — The category × day-of-week heatmap root
 * (`data-testid="stats-cat-heatmap"`) is a static, purely presentational
 * chart that exposes itself to assistive tech as a single image
 * (`role="img"` + literal `aria-label`, W1250) with per-cell hover
 * tooltips via `title`. It is NOT a disclosure widget, menu trigger,
 * listbox opener, or any other control that can summon a popup, dialog,
 * tree, grid, listbox, or menu. Stamping `aria-haspopup` onto the root
 * would falsely advertise a popup-owning relationship to screen readers
 * — many AT implementations announce "has popup" / surface an extra
 * "open menu" affordance, polluting the heatmap's image-only semantics
 * and misleading users into expecting an interactive expansion target
 * that does not exist.
 *
 * Already pinned on the same root: aria-label + role="img" (W1250),
 * aria-labelledby absence (W2019), aria-describedby absence (W2386),
 * aria-controls absence (W2650), lang absence (W2692), style absence
 * (W2106). Pin the absence of `aria-haspopup` here so a refactor that
 * wires the heatmap into a popup/menu pattern (or copies aria-haspopup
 * over from a real disclosure control) fails loudly before shipping a
 * regression in heatmap screen-reader semantics.
 */
describe("StatsPage cat heatmap aria-haspopup absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2764: stats-cat-heatmap root has no aria-haspopup attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("aria-haspopup")).toBe(false);
  });
});
