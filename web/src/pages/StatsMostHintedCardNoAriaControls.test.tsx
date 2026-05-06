import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2602: StatsPage's "Most-hinted games" stats card
 * (data-testid="stats-most-hinted") is rendered as a plain
 * <div className="stats-card"> wrapping an <h2>Most-hinted games</h2>
 * heading and either an empty-state paragraph or a
 * <ul className="stats-most-hinted-list"> of ranked rows. The card
 * itself is NOT a disclosure trigger and does not control the
 * visibility/state of any other widget — the per-row Play links
 * navigate via react-router and the Sparkline is rendered inline.
 *
 * Existing pins on this card already cover the absence of `id`
 * (StatsMostHintedCardNoId), inline `style` (StatsMostHintedCardNoStyle),
 * `role` (StatsMostHintedCardNoRole), `aria-label`
 * (StatsMostHintedCardNoAriaLabel), `aria-labelledby`
 * (StatsMostHintedCardNoAriaLabelledBy), `aria-describedby`
 * (StatsMostHintedCardNoAriaDescribedBy), and `aria-hidden`
 * (StatsMostHintedCardNoAriaHidden). No existing test pins the
 * absence of an `aria-controls` attribute on the card div itself.
 *
 * Adding `aria-controls="..."` would (a) imply the card div controls
 * the visibility/state of another element, which is not the semantic
 * relationship in the markup — the card is a static region, not an
 * actionable controller; (b) mislead assistive tech that uses
 * aria-controls to advertise an interactive controller widget on a
 * non-interactive container; and (c) couple the card to a specific
 * controlled element id that downstream tests could come to rely on.
 * Pin the absence so any future change that adds aria-controls to
 * the card div is reviewed deliberately.
 */
describe("StatsPage stats-most-hinted card — aria-controls attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2602: stats-most-hinted card has no aria-controls attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-most-hinted");
    expect(card.tagName).toBe("DIV");
    expect(card.hasAttribute("aria-controls")).toBe(false);
    expect(card.getAttribute("aria-controls")).toBeNull();
  });
});
