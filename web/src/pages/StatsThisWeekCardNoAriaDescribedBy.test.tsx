import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2572: StatsPage's "This week" stats card (data-testid="stats-this-week")
 * is rendered as a plain <div className="stats-card stats-card--week"> with
 * a visible <h2>This week</h2> heading and a <p className="stats-chart-label">
 * subtitle directly inside. Existing pins on this card already cover the
 * tagName, exact className, absence of `id` (W2024), inline `style` (W2140),
 * `tabindex`, explicit `role` (W2345), `aria-label` (W2537), and
 * `aria-labelledby` (W2-...). The sibling <ul data-testid="stats-this-week-list">
 * has its own aria-* absence pins. However, NO existing test pins the absence
 * of an `aria-describedby` attribute on the stats-this-week CARD div itself.
 *
 * Adding `aria-describedby` to the card would (a) wire the subtitle <p>
 * (or another node) as a programmatic description that assistive tech would
 * announce after the card's accessible name, (b) require the card to first
 * gain a landmark role (e.g. `role="region"`) for the description to be
 * surfaced consistently across screen readers, and (c) couple the card's
 * a11y semantics to the existence and id of whatever element is referenced,
 * making future refactors of the subtitle/heading copy riskier. Pin the
 * absence so any future change that attaches a programmatic description to
 * the card div is reviewed deliberately. Mirrors W2537 (this-week card
 * no-aria-label) and the established CardNoAriaDescribedBy pattern used by
 * sibling cards (Achievements, Activity, CatHeatmap).
 */
describe("StatsPage stats-this-week card — aria-describedby attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2572: stats-this-week card has no aria-describedby attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    expect(card.tagName).toBe("DIV");
    expect(card.hasAttribute("aria-describedby")).toBe(false);
    expect(card.getAttribute("aria-describedby")).toBeNull();
  });
});
