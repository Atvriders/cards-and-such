import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2322: StatsPage's achievements card (data-testid="stats-achievements")
 * contains a `.achievements-grid` div which renders ONE child per achievement
 * passing the active filters. With cleared localStorage, the show-locked
 * toggle defaults to `false` (StatsPage.tsx ~L1009-L1016) and no
 * achievements have any progress, so the `filteredAchievements` array
 * collapses to length 0 — falling through to the empty-state `<p
 * class="stats-empty" data-testid="stats-search-empty">No achievements
 * match.</p>` placeholder rendered as the SOLE direct child of the grid
 * (StatsPage.tsx ~L1781-L1783).
 *
 * Existing tests pin the empty-state copy (W1486), the grid container
 * tagName (W1890), the show-locked toggle behavior, and the heading's
 * position inside the card — but NOTHING pins the exact direct
 * child count of the `.achievements-grid` container in the default
 * (cleared-storage) render. A refactor that wraps the empty-state in
 * a sibling `<div>`, splits the grid into multiple cells, or
 * accidentally renders the locked cards even when `showLocked=false`
 * would silently reshape the grid while every existing assertion
 * stayed green. Pin the exact `querySelectorAll(".achievements-grid > *").length`
 * to lock the structural contract.
 */
describe("StatsPage achievements-grid direct child count (default render)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2322: .achievements-grid has exactly 1 direct child (the empty-state) with cleared storage", () => {
    const { container } = render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // Sanity: the achievements card and its grid container must exist.
    const card = screen.getByTestId("stats-achievements");
    const grid = card.querySelector(".achievements-grid") as HTMLElement | null;
    expect(grid).not.toBeNull();

    // Pin the exact direct-child count of the grid using the user-facing
    // `.achievements-grid > *` selector form so the assertion fails if a
    // refactor inserts/removes a sibling under the grid.
    expect(container.querySelectorAll(".achievements-grid > *").length).toBe(1);
  });
});
