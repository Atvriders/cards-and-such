import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1817: StatsPage drill-down renders its outer container as
 * `<div className="stats-drill-panel" data-testid="stats-drill-panel">`.
 * Existing drill-down tests pin the close button's aria-label (W1256), the
 * play link className (W1666), the head wrapper className (W1676), the
 * title span className (W1685), the cat-badge className (W1697), the best-
 * time row className (W1707), the row `<em>` values (W1716/W1729/W1756/
 * W1770/W1783/W1794/W1804), the best-time value span class (W1742), and
 * the list `<li>` count of 8 (W1653) — but none assert the panel root's
 * own className. A refactor that renamed `stats-drill-panel` to
 * `stats-drill-root` (or hoisted the `data-testid` to a different element)
 * would silently break the panel's CSS layout while every other drill-
 * down test continued to pass. We open the drill-down by clicking a top-
 * played bar, then pin that the testid'd element is a `<div>` whose
 * className is exactly `"stats-drill-panel"`.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage drill-down — stats-drill-panel root div className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1817: drill-down panel root is a <div class='stats-drill-panel'>", () => {
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
    expect(panel.tagName).toBe("DIV");
    expect(panel.className).toBe("stats-drill-panel");
  });
});
