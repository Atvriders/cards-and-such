import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2553: StatsPage's "Top played" categories stats card
 * (data-testid="stats-categories") is rendered as a plain
 * <div className="stats-card stats-card--exportable">. Its accessible-name
 * story is carried by the visible <h2>Top played</h2> heading directly
 * inside the card, not by an authored `aria-label` override on the card
 * div itself. Existing pins on this card already cover its exact className
 * (W1936), tagName (StatsCategoriesCardTag), and absence of `id` (W2027),
 * inline `style` (W2128), and `tabindex` (W2258). Sibling cards have their
 * own aria-label-absence pins (W2537 stats-this-week, and the
 * StatsAchievementsCardNoAriaLabel / StatsMostHintedCardNoAriaLabel /
 * StatsPersonalRecordsCardNoAriaLabel / StatsThisWeekCardNoAriaLabel suite),
 * but NO existing test pins the absence of an `aria-label` attribute on the
 * stats-categories CARD div itself. Adding `aria-label="Top played"`
 * (or similar) to the card would (a) introduce a second accessible name
 * that could drift from the visible <h2>, (b) silently change how
 * assistive tech announces the region if the card later gains
 * `role="region"`, and (c) make the card discoverable via
 * getByRole(..., { name: ... }) in a way downstream tests could couple
 * to. Pin the absence so any future change that attaches an authored name
 * to the card div is reviewed deliberately.
 */
describe("StatsPage stats-categories card — aria-label attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2553: stats-categories card has no aria-label attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-categories");
    expect(card.tagName).toBe("DIV");
    expect(card.hasAttribute("aria-label")).toBe(false);
    expect(card.getAttribute("aria-label")).toBeNull();
  });
});
