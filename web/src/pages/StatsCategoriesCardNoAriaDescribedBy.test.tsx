import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2587: StatsPage's "Top played" categories stats card
 * (data-testid="stats-categories") is rendered as a plain
 * <div className="stats-card stats-card--exportable">. Existing pins on
 * this card already cover its exact className (W1936), tagName
 * (StatsCategoriesCardTag), and absence of `id` (W2027), inline `style`
 * (W2128), `tabindex` (W2258), `role` (StatsCategoriesCardNoRole),
 * `aria-label` (W2553), and `aria-labelledby` (W2574). Sibling cards
 * have analogous NoAriaDescribedBy pins (e.g.
 * StatsAchievementsCardNoAriaDescribedBy, StatsActivityNoAriaDescribedBy,
 * StatsCatHeatmapNoAriaDescribedBy, StatsMostHintedCardNoAriaDescribedBy,
 * StatsPersonalRecordsCardNoAriaDescribedBy, StatsThisWeekCardNoAriaDescribedBy),
 * but NO existing test pins the absence of an `aria-describedby`
 * attribute on the stats-categories CARD div itself. Adding
 * `aria-describedby="..."` would (a) silently couple the card to a
 * specific id elsewhere in the tree (which could be removed/renamed
 * without test coverage), (b) cause assistive tech to announce
 * additional descriptive text alongside the card region (changing the
 * announcement story), and (c) introduce hidden semantic dependencies
 * between this card and other DOM nodes. Pin the absence so any future
 * change that attaches an authored aria-describedby association is
 * reviewed deliberately.
 */
describe("StatsPage stats-categories card — aria-describedby attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2587: stats-categories card has no aria-describedby attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-categories");
    expect(card.tagName).toBe("DIV");
    expect(card.hasAttribute("aria-describedby")).toBe(false);
    expect(card.getAttribute("aria-describedby")).toBeNull();
  });
});
