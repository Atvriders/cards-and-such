import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2027: StatsPage's "Top played" categories stats card
 * (data-testid="stats-categories"), which wraps the bar-chart panel and
 * its drill-down details, is currently rendered WITHOUT an `id`
 * attribute. Sibling tests pin a number of adjacent contracts on this
 * same node:
 *   - StatsCategoriesCardClass pins exact className equality
 *     ("stats-card stats-card--exportable").
 *   - StatsCategoriesTitleClass pins the nested h2 typography.
 *   - StatsSectionTopPlayedH2Parent (W1460) pins the "Top played" h2 as
 *     a direct child of this same .stats-card div.
 * However, no existing test pins the absence of an `id` attribute on
 * the stats-categories card element itself. Adding an `id` would create
 * a stable in-page anchor / DOM-query handle (e.g. for fragment links,
 * ScrollSpy targets, label-for relationships, or external scripts) that
 * downstream code could silently come to depend on, turning later
 * removal into a hidden breaking change. The current design routes all
 * addressing through `data-testid` (for tests) and class hooks (for
 * styling) so the card's identity stays decoupled from any in-page
 * anchor contract. Mirrors W2000 (Activity card no-id pin). Pin the
 * absence of an `id` so any future change that adds one is reviewed
 * deliberately.
 */
describe("StatsPage stats-categories card — id attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2027: stats-categories card has no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-categories");
    expect(card.hasAttribute("id")).toBe(false);
  });
});
