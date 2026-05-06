import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2574: StatsPage's "Top played" categories stats card
 * (data-testid="stats-categories") is rendered as a plain
 * <div className="stats-card stats-card--exportable">. The card's
 * accessible-name story is carried by the visible <h2>Top played</h2>
 * heading directly inside the card, NOT by an `aria-labelledby`
 * association pointing at an `id` elsewhere in the DOM. Existing pins
 * on this card already cover its exact className (W1936), tagName
 * (W2365), and absence of `id` (W2027), inline `style` (W2128),
 * `tabindex` (W2258), `role` (StatsCategoriesCardNoRole), and
 * `aria-label` (W2553). Sibling cards have analogous
 * NoAriaLabelledBy pins (e.g. StatsAchievementsCardNoAriaLabelledBy),
 * but NO existing test pins the absence of an `aria-labelledby`
 * attribute on the stats-categories CARD div itself. Adding
 * `aria-labelledby="..."` would (a) introduce a second accessible
 * name source that could drift from the visible <h2>, (b) silently
 * couple the card to a specific id elsewhere in the tree (which
 * could be removed/renamed without test coverage), and (c) make
 * the card discoverable via getByRole(..., { name }) once a role
 * is added — affecting downstream a11y assertions. Pin the absence
 * so any future change that attaches an authored aria-labelledby
 * association is reviewed deliberately.
 */
describe("StatsPage stats-categories card — aria-labelledby attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2574: stats-categories card has no aria-labelledby attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-categories");
    expect(card.tagName).toBe("DIV");
    expect(card.hasAttribute("aria-labelledby")).toBe(false);
    expect(card.getAttribute("aria-labelledby")).toBeNull();
  });
});
