import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2014: StatsPage's "Activity" stats card (data-testid="stats-activity"),
 * which wraps the line-chart panel and the top summary stats, is currently
 * rendered WITHOUT either an `aria-label` or an `aria-labelledby`
 * attribute. Sibling tests pin adjacent contracts on this same node:
 *   - W1924 pins exact className equality ("stats-card stats-card--exportable").
 *   - W1850 pins tagName=DIV.
 *   - W1959 pins the card's child count.
 *   - W2000 pins the absence of an `id` attribute.
 *   - W1930 pins the absence of aria-label/aria-labelledby on the PARENT
 *     `.stats-card-grid` <section>, not on this card.
 * However, no existing test pins the absence of `aria-label` or
 * `aria-labelledby` on the stats-activity card itself. Because the card is
 * a plain `<div>` (not a landmark or a `<section>`), adding either aria
 * attribute would silently promote the card to a named generic region in
 * the accessibility tree, changing screen-reader navigation order and
 * region announcements. The card's accessible name is intentionally
 * carried by its child heading ("Activity" h2) and by the per-chart
 * `aria-label` on the inner SVG/canvas, NOT by an aria attribute on the
 * outer wrapper. Pin the absence of both `aria-label` and `aria-labelledby`
 * so any future change that adds either is reviewed deliberately.
 */
describe("StatsPage stats-activity card — aria-label/aria-labelledby absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2014: stats-activity card has no aria-label or aria-labelledby attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-activity");
    expect(card.hasAttribute("aria-label")).toBe(false);
    expect(card.hasAttribute("aria-labelledby")).toBe(false);
  });
});
