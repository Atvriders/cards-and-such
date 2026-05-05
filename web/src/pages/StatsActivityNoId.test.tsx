import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2000: StatsPage's "Activity" stats card (data-testid="stats-activity"),
 * which wraps the line-chart panel and the top summary stats, is currently
 * rendered WITHOUT an `id` attribute. Sibling tests pin a number of
 * adjacent contracts on this same node:
 *   - W1924 pins exact className equality ("stats-card stats-card--exportable").
 *   - W1850 pins tagName=DIV.
 *   - W1959 pins the card's child count.
 *   - W1263 pins the nested "Activity" h2 / parent relationship.
 *   - W1998 pins the absence of an `id` on the parent .stats-card-grid <section>.
 * However, no existing test pins the absence of an `id` attribute on the
 * stats-activity card element itself. Adding an `id` would create a stable
 * in-page anchor / DOM-query handle (e.g. for fragment links, ScrollSpy
 * targets, label-for relationships, or external scripts) that downstream
 * code could silently come to depend on, turning later removal into a
 * hidden breaking change. The current design routes all addressing through
 * `data-testid` (for tests) and class hooks (for styling) so the card's
 * identity stays decoupled from any in-page anchor contract. Pin the
 * absence of an `id` so any future change that adds one is reviewed
 * deliberately.
 */
describe("StatsPage stats-activity card — id attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2000: stats-activity card has no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-activity");
    expect(card.hasAttribute("id")).toBe(false);
  });
});
