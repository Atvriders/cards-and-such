import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2140: StatsPage's "This week" stats card (data-testid="stats-this-week")
 * — the wrapper <div> that frames the current-vs-prior-7-day comparison
 * list, the per-row deltas, and the nested stats-prev-week breakdown —
 * carries NO inline `style` attribute. Its visual framing (card chrome,
 * padding, spacing, border / background) is owned entirely by the
 * `.stats-card` and `.stats-card--week` CSS class hooks pinned by the
 * sibling W1612 wrapper-class contract.
 *
 * Sibling absence contracts are already pinned for this exact node:
 * className equality (W1612), tagName=DIV implied by parent class checks,
 * and absence of an `id` attribute (W2024). The inner <ul> list has its
 * own absence-of-style contract (W2118), and parallel cards on the page
 * already pin no-style at the card level (stats-activity, stats-summary,
 * stats-card-grid, stats-personal-records, stats-records-by-cat,
 * stats-replays-card, stats-most-hinted, stats-categories,
 * stats-achievements, stats-cat-heatmap, stats-hour-of-day,
 * stats-line-chart, stats-hour-chart). The this-week card is the only
 * top-level stats card on the page that does NOT yet have a no-style
 * contract on its outer <div>.
 *
 * An inline `style` on the card wrapper would (a) raise CSS specificity
 * above the `.stats-card` / `.stats-card--week` rules and silently break
 * theme overrides, print stylesheets, and responsive variants;
 * (b) couple presentation to JS-side string templating instead of the
 * single CSS source of truth shared by every sibling card; and
 * (c) diverge from the established convention that all stats cards route
 * styling exclusively through class hooks. Pin the ABSENCE of `style` on
 * the stats-this-week card so any future refactor introducing an inline
 * style attribute on this wrapper is caught and reviewed deliberately.
 */
describe("StatsPage stats-this-week card — style attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2140: stats-this-week card has no inline style attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    expect(card.hasAttribute("style")).toBe(false);
    expect(card.getAttribute("style")).toBeNull();
  });
});
