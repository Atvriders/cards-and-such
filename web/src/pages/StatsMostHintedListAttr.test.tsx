import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2190: StatsPage's "Most-hinted games" stats card
 * (data-testid="stats-most-hinted") renders its ranked rows inside an
 * inner <ul className="stats-most-hinted-list">. All visual presentation
 * (row spacing, rank/title/sparkline/count/play-link column layout, the
 * border/divider treatment) flows from the `.stats-most-hinted-list` CSS
 * hook in StatsPage.css.
 *
 * Sibling tests pin adjacent contracts on this same card:
 *   - StatsMostHintedCardNoStyle (W2131) pins the OUTER `stats-card`
 *     wrapper's no-style-attr; it does not touch the inner <ul>.
 *   - StatsMostHintedCardNoId / StatsMostHintedWrapClass pin wrapper
 *     attributes (no `id`, exact `stats-card` className).
 *   - StatsMostHintedRankClass / StatsMostHintedTitleClass /
 *     StatsMostHintedCountClass pin per-row leaf span classNames.
 *   - StatsSectionH2MostHintedParent pins the H2's parent relationship.
 *
 * No existing test pins the inner list element itself — neither its
 * tagName nor the absence of an inline `style` attribute. An inline
 * `style` on this <ul> would (a) raise CSS specificity above the
 * `.stats-most-hinted-list` stylesheet rules and silently break theme /
 * print / responsive overrides, (b) couple presentation to JS-side
 * string templating instead of a single CSS source of truth, and
 * (c) diverge from the sibling list patterns (this-week list, prev-week
 * list, personal-records list) which are all CSS-class-driven.
 *
 * Pin the absence of `style` on the inner most-hinted <ul> — together
 * with a defensive tagName=UL check — so any future refactor that
 * introduces an inline style or swaps the list tag (e.g. <ol>, <div>)
 * is caught and reviewed deliberately.
 */
describe("StatsPage stats-most-hinted — inner list attribute pin", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2190: stats-most-hinted inner <ul.stats-most-hinted-list> has no inline style attribute", () => {
    // Seed a hint count so the list (rather than the empty-state <p>)
    // renders. Without a positive hint count, the card renders the empty
    // state and there is no <ul> to query.
    localStorage.setItem(
      "cards-hints-used",
      JSON.stringify({ klondike: 5 }),
    );

    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-most-hinted");
    const list = within(card).getByTestId("stats-most-hinted-row-0")
      .parentElement as HTMLElement | null;
    expect(list).not.toBeNull();
    // Defensive: confirm we located the inner list element itself.
    expect(list?.tagName).toBe("UL");
    expect(list?.classList.contains("stats-most-hinted-list")).toBe(true);

    // Pin the absence of an inline `style` attribute on the inner list.
    // Layout / spacing / column rhythm are owned entirely by
    // `.stats-most-hinted-list` in CSS; an inline style would raise
    // specificity above the stylesheet and couple presentation to JS.
    expect(list?.hasAttribute("style")).toBe(false);
    expect(list?.getAttribute("style")).toBeNull();
  });
});
