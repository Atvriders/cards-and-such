import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2066 — The category × day-of-week heatmap renders six `.stats-heatmap-row`
 * elements (one decorative head row + five category data rows). None of them
 * carry an `id` attribute today: the rows are addressed by class + descendant
 * test ids only, and the chart's accessible identity lives on the grid root
 * (`data-testid="stats-cat-heatmap"`, `role="img"`, `aria-label`). Adding an
 * `id` to any row would (a) pollute the global id namespace inside a page
 * that is rendered alongside dialogs / modals / leaderboards (raising the
 * risk of duplicate-id a11y violations when the page is mounted twice in
 * tests or transitions), and (b) imply a stable anchor target that the
 * heatmap explicitly does not promise. No existing test pins the absence of
 * `id` on these rows — the closest sibling tests pin `aria-hidden`, `title`,
 * and `role` absence. Lock in the no-id contract so accidental id additions
 * during refactors are caught here.
 */
describe("StatsPage heatmap rows id attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2066: every .stats-heatmap-row element has no `id` attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    const allRows = Array.from(grid.querySelectorAll(".stats-heatmap-row"));
    // 1 head row + 5 category data rows.
    expect(allRows.length).toBe(6);
    for (const row of allRows) {
      expect(row.hasAttribute("id")).toBe(false);
    }
  });
});
