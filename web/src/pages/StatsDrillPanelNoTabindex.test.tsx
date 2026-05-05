import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2286: StatsPage drill-down panel root `<div className="stats-drill-panel"
 * data-testid="stats-drill-panel">` is intentionally rendered WITHOUT a
 * `tabindex` attribute. The panel is a passive container that displays
 * details for the bar the user just clicked; focus management is handled by
 * the close button (which already participates in the natural tab order via
 * its `<button>` element). Adding `tabindex="0"` to the panel itself would
 * insert an extra empty tab stop on a non-interactive `<div>`, while
 * `tabindex="-1"` would imply programmatic focus targeting that the
 * StatsPage does not actually perform — the panel is never imperatively
 * focused after open. Existing drill-down tests pin the panel's tagName and
 * className (W1817), the head wrapper (W1676), the close button (W1256),
 * the list `<ul>` class (W1653), the absence of `id` (W2085), and various
 * row `<em>` values — but none assert that the panel root has no
 * `tabindex`. A refactor that sprinkled a `tabindex` onto the panel (e.g.
 * because someone tried to make the whole panel focusable for keyboard-only
 * users) would silently violate this invariant while every other drill-down
 * test continued to pass. We open the drill-down by clicking the only
 * seeded top-played bar, then pin that the panel root has no `tabindex`.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage drill-down — stats-drill-panel root has no tabindex", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2286: drill-down panel root <div> has no tabindex attribute", () => {
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

    // Open the drill-down for the only seeded game.
    fireEvent.click(screen.getByTestId("stats-drill-klondike"));
    const panel = screen.getByTestId("stats-drill-panel");
    expect(panel.hasAttribute("tabindex")).toBe(false);
  });
});
