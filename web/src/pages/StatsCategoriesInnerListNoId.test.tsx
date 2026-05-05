import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2484: The StatsPage `stats-categories` card (Top played) opens an
 * inline drill-down panel whose body is a `<ul className="stats-drill-list">`
 * containing the per-game stat rows. Sibling tests already pin a number of
 * contracts on this inner list:
 *   - StatsDrillListClass (W1653): tag (UL), exact className, 8 rows.
 *   - StatsCategoriesListNoStyle (W2191): no inline `style` attribute.
 *   - Per-row tests pin individual `<li>` internals.
 * However, no existing test pins the *absence* of an `id` attribute on the
 * inner `stats-drill-list` ul. Adding an `id` here would be a footgun: the
 * drill-down panel can be opened multiple times during a session (the same
 * card can be re-rendered as the user clicks different bars) and any global
 * `id` would create duplicate-id violations the moment a second instance of
 * the card mounts (e.g. during route transitions, in the printable
 * exportable view, or in tests that mount StatsPage twice). Mirrors the
 * `*NoId` pins applied to outer cards (StatsCategoriesCardNoId,
 * StatsAchievementsCardNoId) and other inner lists. The component routes
 * all targeting through `data-testid` and className hooks, so an `id` would
 * also be redundant. Pin the absence so any future `id={...}` addition is
 * reviewed deliberately.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage stats-categories drill-down list — id attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2484: stats-drill-list ul inside stats-categories card has no id attribute", () => {
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

    // Walk down via stable testids to avoid coupling to the className we
    // are indirectly relying on (which would be tautological).
    const card = screen.getByTestId("stats-categories");
    const panel = within(card).getByTestId("stats-drill-panel");
    const hintRow = within(panel).getByTestId("stats-drill-hints");
    const list = hintRow.parentElement;
    expect(list).not.toBeNull();
    expect(list!.tagName).toBe("UL");
    expect(list!.hasAttribute("id")).toBe(false);
  });
});
