import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2191: The StatsPage `stats-categories` card (Top played) renders an
 * inner `<ul className="stats-drill-list">` inside the inline drill-down
 * panel that opens when a user clicks a bar in the chart. Sibling tests
 * pin a wide range of contracts on and around this list:
 *   - StatsDrillListClass (W1653) pins tag (UL), exact className, and
 *     row count (8 stat rows).
 *   - StatsDrillBestTimeLiClass / StatsDrillHeadClass / per-row Em pins
 *     guard the row internals.
 *   - StatsCategoriesCardNoStyle (W2128) pins the *outer* card's style
 *     attribute absence.
 * However, no existing test pins the absence of an inline `style`
 * attribute on the inner `stats-drill-list` ul itself. Adding inline
 * styles to this list would bypass the CSS class hooks (.stats-drill-list,
 * surrounding .stats-drill-panel rules) used for spacing, list-padding
 * resets, and dark/light theming, leading to specificity wars and broken
 * theme overrides. The current design routes all presentation through
 * stylesheet rules keyed off the className. Mirrors the no-style pins
 * applied to `stats-this-week-list`, `stats-prev-week-list`, and the
 * outer card, keeping the DOM free of presentation styling. Pin the
 * absence of a `style` attribute so any future inline-style addition is
 * reviewed deliberately.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage stats-categories drill-down list — style attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2191: stats-drill-list ul inside stats-categories card has no inline style attribute", () => {
    localStorage.setItem(
      STATS_KEY,
      JSON.stringify({
        totalPlayed: 12,
        totalWins: 5,
        longestStreak: 0,
        currentStreak: 0,
        perGame: {
          klondike: { played: 12, wins: 5, best: 300 },
        },
        perCategory: { solitaire: 12 },
        daysPlayed: [],
        unlocked: [],
      }),
    );

    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // Open the drill-down so the inner list mounts.
    fireEvent.click(screen.getByTestId("stats-drill-klondike"));

    // Locate the categories card and walk down to the inner list via
    // the hint-row testid (avoids tautologically querying by the
    // className we're indirectly relying on).
    const card = screen.getByTestId("stats-categories");
    const panel = within(card).getByTestId("stats-drill-panel");
    const hintRow = within(panel).getByTestId("stats-drill-hints");
    const list = hintRow.parentElement;
    expect(list).not.toBeNull();
    expect(list!.tagName).toBe("UL");
    expect(list!.hasAttribute("style")).toBe(false);
  });
});
