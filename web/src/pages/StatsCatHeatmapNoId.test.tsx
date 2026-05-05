import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2001 — The category × day-of-week heatmap chart's grid root is identified
 * for tests and queries via `data-testid="stats-cat-heatmap"` and is made
 * accessible to screen readers via `role="img"` + `aria-label` (W1250). It
 * deliberately does NOT carry an `id` attribute: the chart is rendered once
 * per StatsPage mount, no in-page anchor links target it, no `<label
 * htmlFor>` references it, and aria-* relations point at testids and
 * classnames rather than DOM ids. Adding an `id` would invite duplicate-id
 * collisions if the chart is ever rendered twice (e.g. inside a comparison
 * view or a modal preview) and would tempt callers to depend on a brittle
 * selector that bypasses the testid contract. Pin the absence of `id` on the
 * heatmap root so a refactor that hoists an id onto the chart fails here
 * before it ships.
 */
describe("StatsPage cat heatmap id absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2001: stats-cat-heatmap root has no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("id")).toBe(false);
  });
});
