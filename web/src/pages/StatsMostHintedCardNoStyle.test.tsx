import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2131: StatsPage's "Most-hinted games" stats card
 * (data-testid="stats-most-hinted"), which wraps the h2, the empty-state
 * paragraph, and the ranked list of most-hinted games (rank, title,
 * sparkline, count, Play link), is currently rendered WITHOUT an inline
 * `style` attribute. Sibling tests already pin adjacent contracts on this
 * same node and its descendants:
 *   - StatsMostHintedCardNoId pins the absence of an `id` attribute.
 *   - StatsMostHintedWrapClass pins the wrapper className.
 *   - StatsSectionH2MostHintedParent pins the nested "Most-hinted games"
 *     h2 and its parent relationship.
 *   - StatsMostHintedRankClass / StatsMostHintedTitleClass /
 *     StatsMostHintedCountClass pin the per-row span classNames.
 *   - StatsCardsCount confirms this card is one of the rendered stats
 *     cards.
 * However, no existing test pins the absence of an inline `style`
 * attribute on the stats-most-hinted card element itself. All visual
 * presentation for this card flows through the `stats-card` className and
 * its CSS rules; introducing an inline `style` would couple component
 * markup to ad-hoc visual decisions, defeat theme/CSS overrides, and make
 * later restyling a silent risk. Pin the absence of `style` so any future
 * change that introduces one is reviewed deliberately.
 */
describe("StatsPage stats-most-hinted card — style attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2131: stats-most-hinted card has no style attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-most-hinted");
    expect(card.hasAttribute("style")).toBe(false);
  });
});
