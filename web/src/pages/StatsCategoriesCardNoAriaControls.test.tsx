import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2598: StatsPage's "Top played" categories stats card
 * (data-testid="stats-categories") is rendered as a plain
 * <div className="stats-card stats-card--exportable"> with a visible
 * <h2>Top played</h2> heading and a BarChart inside. The card itself
 * is NOT a disclosure trigger or a control for any other widget — it
 * is a static region. Existing pins on this card already cover its
 * className (W1936), tagName (StatsCategoriesCardTag), and the absence
 * of `id` (W2027), inline `style` (W2128), `tabindex` (W2258),
 * `aria-label` (W2553), `aria-labelledby` (StatsCategoriesCardNoAriaLabelledBy),
 * `aria-describedby` (StatsCategoriesCardNoAriaDescribedBy), and
 * `aria-hidden` (StatsCategoriesCardNoAriaHidden). However, no
 * existing test pins the absence of an `aria-controls` attribute on
 * the card div itself. Adding `aria-controls="..."` would (a) imply
 * the card div controls the visibility/state of another element
 * (e.g. the drill panel), which is not the semantic relationship in
 * the markup — the drill panel is owned by the BarChart bar buttons,
 * not by the wrapping card; (b) be misleading to assistive tech that
 * uses aria-controls to advertise an actionable controller widget on
 * a non-interactive container; and (c) couple the card to a specific
 * controlled element id in a way downstream tests could rely on.
 * Pin the absence so any future change that adds aria-controls to
 * the card div is reviewed deliberately.
 */
describe("StatsPage stats-categories card — aria-controls attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2598: stats-categories card has no aria-controls attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-categories");
    expect(card.tagName).toBe("DIV");
    expect(card.hasAttribute("aria-controls")).toBe(false);
    expect(card.getAttribute("aria-controls")).toBeNull();
  });
});
