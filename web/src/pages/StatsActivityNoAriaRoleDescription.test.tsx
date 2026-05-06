import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2714: StatsPage's "Activity" stats card (data-testid="stats-activity"),
 * which wraps the line-chart panel and the top summary stats, is currently
 * rendered WITHOUT an `aria-roledescription` attribute. Sibling tests pin
 * adjacent contracts on this same node:
 *   - W2014 pins the absence of aria-label/aria-labelledby.
 *   - W1924 pins exact className equality ("stats-card stats-card--exportable").
 *   - W1850 pins tagName=DIV.
 *   - W1959 pins the card's child count.
 *   - W2000 pins the absence of an `id` attribute.
 * However, no existing test pins the absence of `aria-roledescription` on the
 * stats-activity card itself. Because the card is a plain `<div>` (with no
 * explicit `role`), adding `aria-roledescription` would silently override
 * the implicit role description used by assistive tech, producing a
 * misleading announcement (e.g. "stats activity, region") even though the
 * element is not a landmark. The card's accessible context is intentionally
 * carried by its child heading ("Activity" h2) and by the per-chart
 * `aria-label` on the inner SVG, NOT by an `aria-roledescription` on the
 * outer wrapper. Pin the absence of `aria-roledescription` so any future
 * change that adds it is reviewed deliberately.
 */
describe("StatsPage stats-activity card — aria-roledescription absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2714: stats-activity card has no aria-roledescription attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-activity");
    expect(card.hasAttribute("aria-roledescription")).toBe(false);
  });
});
