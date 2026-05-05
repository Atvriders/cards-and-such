import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2365: StatsPage's "Top played" categories stats card (the bar-chart
 * panel exposed via data-testid="stats-categories") is rendered as a
 * native <div> element. Existing tests pin adjacent contracts on this
 * same card:
 *   - W1936 (StatsCategoriesCardClass): exact className equality.
 *   - W2027 (StatsCategoriesCardNoId): no id attribute.
 *   - W2128 (StatsCategoriesCardNoStyle): no inline style attribute.
 *   - W2258 (StatsCategoriesNoTabindex): no tabindex attribute.
 *   - W1460 (StatsSectionTopPlayedH2Parent): h2 nested inside, with
 *     classList.contains("stats-card") + data-testid match — but this
 *     deliberately uses classList membership / testid, not tagName, so
 *     a refactor that swapped the wrapper to a <section>, <article>,
 *     <aside>, or <fieldset> while keeping the className + testid would
 *     silently slip past every existing assertion.
 * The card being a plain <div> is load-bearing because the StatsPage
 * layout grid + the shared "stats-card" / "stats-card--exportable" CSS
 * rules are written against generic block-level divs; promoting the
 * card to a semantic landmark (<section>/<aside>) would inject an
 * implicit ARIA role into the page's accessibility tree (region /
 * complementary), changing screen-reader navigation without any visual
 * cue. Pin the tagName so any such silent semantic drift fails fast.
 */
describe("StatsPage stats-categories card — tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2365: stats-categories card is rendered as a DIV element", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-categories");
    expect(card.tagName).toBe("DIV");
  });
});
