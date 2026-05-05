import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2028: StatsPage's "Most-hinted games" stats card
 * (data-testid="stats-most-hinted"), which wraps the h2, the empty-state
 * paragraph, and the ranked list of most-hinted games (rank, title,
 * sparkline, count, Play link), is currently rendered WITHOUT an `id`
 * attribute. Sibling tests pin a number of adjacent contracts on this same
 * node and its descendants:
 *   - StatsMostHintedWrapClass pins the wrapper className.
 *   - StatsSectionH2MostHintedParent pins the nested "Most-hinted games"
 *     h2 and its parent relationship.
 *   - StatsMostHintedRankClass / StatsMostHintedTitleClass /
 *     StatsMostHintedCountClass pin the per-row span classNames.
 *   - StatsCardsCount confirms this card is one of the rendered stats
 *     cards.
 * However, no existing test pins the absence of an `id` attribute on the
 * stats-most-hinted card element itself. Adding an `id` would create a
 * stable in-page anchor / DOM-query handle (e.g. for fragment links such
 * as `#stats-most-hinted`, ScrollSpy targets, label-for relationships, or
 * external scripts) that downstream code could silently come to depend
 * on, turning later removal into a hidden breaking change. The current
 * design routes all addressing through `data-testid` (for tests) and
 * class hooks (for styling) so the card's identity stays decoupled from
 * any in-page anchor contract. Pin the absence of an `id` so any future
 * change that adds one is reviewed deliberately.
 */
describe("StatsPage stats-most-hinted card — id attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2028: stats-most-hinted card has no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-most-hinted");
    expect(card.hasAttribute("id")).toBe(false);
  });
});
