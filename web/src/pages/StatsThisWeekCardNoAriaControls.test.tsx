import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2606: StatsPage's "This week" stats card (data-testid="stats-this-week")
 * is rendered as a plain <div className="stats-card stats-card--week"> with
 * static heading + summary list content directly inside. The card is not a
 * disclosure trigger, tab, combobox, or any other widget that owns/controls
 * a separate region whose visibility/state it toggles. Existing pins on this
 * card already cover tagName, exact className, absence of `id` (W2024),
 * inline `style` (W2140), `tabindex`, explicit `role` (W2345), `aria-label`
 * (W2537), `aria-labelledby`, `aria-describedby` (W2572), and `aria-hidden`.
 * However, NO existing test pins the absence of an `aria-controls` attribute
 * on the stats-this-week CARD div itself.
 *
 * Adding `aria-controls` to the card would (a) imply this static summary
 * <div> programmatically owns/toggles another element, which is false and
 * misleading to assistive tech, (b) require a referenced id to actually
 * exist in the DOM (otherwise it's a dangling reference and an a11y lint
 * failure), and (c) typically pair with a widget role (button/tab/combobox)
 * the card deliberately does not have. Pin the absence so any future change
 * that attaches a controls relationship to this static card is reviewed
 * deliberately. Mirrors W2572 (this-week card no-aria-describedby) and the
 * established CardNoAriaControls pattern used by sibling cards
 * (StatsActivityNoAriaControls, StatsCategoriesCardNoAriaControls,
 * StatsMostHintedCardNoAriaControls, StatsPersonalRecordsCardNoAriaControls).
 */
describe("StatsPage stats-this-week card — aria-controls attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2606: stats-this-week card has no aria-controls attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    expect(card.tagName).toBe("DIV");
    expect(card.hasAttribute("aria-controls")).toBe(false);
    expect(card.getAttribute("aria-controls")).toBeNull();
  });
});
