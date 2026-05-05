import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2106 — The category × day-of-week heatmap chart's grid root is identified
 * for tests and queries via `data-testid="stats-cat-heatmap"` and is made
 * accessible to screen readers via `role="img"` + `aria-label` (W1250). All
 * of its visual presentation — the CSS grid layout, gap sizing, accent
 * coloring, label column width, etc. — is owned by the `.stats-heatmap`
 * className and lives in the StatsPage stylesheet, NOT in an inline `style`
 * attribute. The grid root itself deliberately carries no `style` attribute:
 * inline styles would override theme-level CSS without a way for users with
 * custom themes (high-contrast, dark mode, accent-color overrides) to opt
 * out, would defeat caching of computed styles across the 35 cells, and
 * would invite drift between the two coloring paths (root vs. per-cell
 * `style={{ opacity }}` on data cells, which is intentional and pinned by
 * the cell-level tests). Existing W1250/W1341/W1364/W1445/W2001 coverage
 * pins testid, aria, role, classes, structural relationships, and id
 * absence on this same element, but NOTHING pins the absence of an inline
 * `style` attribute. A refactor that smuggles `style={{ display: "grid",
 * gridTemplateColumns: ... }}` onto the root — for example, to make the
 * column count dynamic — would silently override the className-driven
 * theme contract and pass every existing test. Pin the absence of `style`
 * on the heatmap root so that drift fails here before it ships.
 */
describe("StatsPage cat heatmap style absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2106: stats-cat-heatmap root has no style attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("style")).toBe(false);
  });
});
