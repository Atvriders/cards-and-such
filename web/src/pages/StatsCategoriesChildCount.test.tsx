import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2486: StatsPage's "Top played" categories stats card (exposed via
 * data-testid="stats-categories") has a structurally fixed top-level
 * child layout in the empty / no-plays state. With a cleared
 * localStorage (no recorded plays), `categoryBarData` is empty, no
 * drill panel is shown, and `bestPerCategory` is empty, so the card's
 * direct element children are exactly four, in DOM order:
 *   1. <button class="stats-export-btn" data-testid="stats-export-bar">
 *   2. <h2>Top played</h2>
 *   3. <div class="stats-chart-label">…</div>
 *   4. <p class="stats-empty">No games played yet.</p>
 *
 * Existing tests around this same card pin adjacent contracts but
 * deliberately do NOT pin the *count* of direct children:
 *   - W1936 (StatsCategoriesCardClass): exact className equality.
 *   - W2027 (StatsCategoriesCardNoId): no id attribute.
 *   - W2128 (StatsCategoriesCardNoStyle): no inline style attribute.
 *   - W2258 (StatsCategoriesNoTabindex): no tabindex attribute.
 *   - W2365 (StatsCategoriesCardTag): tagName === "DIV".
 *   - W1460 (StatsSectionTopPlayedH2Parent): h2 nested inside.
 * None of those would catch a refactor that injected an extra wrapper
 * (e.g., a header <div> that swallowed the export button + h2 +
 * chart-label) or appended an extra sibling (a footer / hint slot)
 * inside the card. Pinning `childElementCount` ensures the empty-state
 * layout cannot silently grow or shrink without an explicit test
 * update — important because the BarChart export button + h2 +
 * chart-label + empty `<p>` are all *direct* children that the CSS
 * layout (`.stats-card--exportable` flow) is written against.
 */
describe("StatsPage stats-categories card — direct child count", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2486: stats-categories card has exactly 4 direct element children in the empty state", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-categories");
    expect(card.childElementCount).toBe(4);
  });
});
