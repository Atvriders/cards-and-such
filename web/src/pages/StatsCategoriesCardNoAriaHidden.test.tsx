import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2591: StatsPage's "Top played" categories stats card
 * (data-testid="stats-categories") is rendered as a plain visible
 * <div className="stats-card stats-card--exportable">. The card carries
 * meaningful content (a Top played heading, the categories list, and
 * exportable stats) and must remain discoverable to assistive tech and
 * the accessibility tree. Existing pins on this card already cover its
 * className (W1936), tagName (StatsCategoriesCardTag), and absence of
 * `id` (W2027), inline `style` (W2128), `tabindex` (W2258),
 * `aria-label` (W2553), `aria-labelledby` (StatsCategoriesCardNoAriaLabelledBy),
 * and `aria-describedby` (StatsCategoriesCardNoAriaDescribedBy). Sibling
 * cards have their own aria-hidden absence pins
 * (StatsActivityNoAriaHidden, StatsMostHintedCardNoAriaHidden,
 * StatsThisWeekCardNoAriaHidden, StatsPersonalRecordsCardNoAriaHidden,
 * StatsHeatmapCellNoAriaHidden), but NO existing test pins the absence
 * of an `aria-hidden` attribute on the stats-categories CARD div itself.
 * Adding `aria-hidden="true"` to this card would (a) hide the entire
 * Top played categories section from screen readers, (b) make all of
 * the card's interactive descendants (drill-down rows, etc.) inaccessible
 * to assistive tech in a way that violates WCAG 4.1.2, and (c) silently
 * remove the section from the a11y tree without any visible change.
 * Pin the absence so any future change that hides the card from
 * assistive tech is reviewed deliberately.
 */
describe("StatsPage stats-categories card — aria-hidden attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2591: stats-categories card has no aria-hidden attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-categories");
    expect(card.tagName).toBe("DIV");
    expect(card.hasAttribute("aria-hidden")).toBe(false);
    expect(card.getAttribute("aria-hidden")).toBeNull();
  });
});
