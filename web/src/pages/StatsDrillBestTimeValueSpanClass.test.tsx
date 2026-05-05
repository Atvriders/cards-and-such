import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1742: StatsPage drill-down panel's "Best time" row is the only
 * stat-row in the drill-list whose value is NOT a bare `<em>`. Instead
 * it nests a `<span className="stats-drill-value">` that wraps both the
 * inline `<Sparkline />` history strip AND the `<em>` holding the
 * formatted best time, so the sparkline visually shares a baseline with
 * the numeric value (see `.stats-drill-best-time .stats-drill-value`
 * flex rule in StatsPage.css). Existing drill-down tests pin the panel
 * wrapper, the close button (W1256), the play link className (W1666),
 * the head wrapper className (W1676), the title span className (W1685),
 * the cat-badge className (W1697), the best-time `<li>` marker class
 * (W1707), the Plays row's value `<em>` (W1716), and the Wins row's
 * value `<em>` (W1729) — but nothing pins the `stats-drill-value` span
 * itself. A refactor that drops the wrapper (so the sparkline floats
 * loose alongside the `<em>`), renames the className for a "design
 * system" rebrand, or swaps the `<span>` for a `<div>` (which would
 * break the inline flex baseline) all silently regress the layout
 * without tripping any existing test. We seed per-game time history,
 * open the drill-down, locate the best-time `<li>` via its marker
 * class, and pin that the inner value wrapper is a `<span>` with the
 * exact `stats-drill-value` className AND that it contains both the
 * sparkline (by testId) and the `<em>` value sibling.
 */
const STATS_KEY = "cards-and-such:stats:v1";
const TIMES_KEY = "cards-time-history:klondike";

describe("StatsPage drill-down — best-time row value <span> wrapper className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1742: best-time <li> nests value+sparkline inside <span class='stats-drill-value'>", () => {
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
    // Seed a non-empty time history so the Sparkline renders inside the
    // wrapper; without it the sparkline branch is skipped and we can't
    // assert co-location of value + chart.
    localStorage.setItem(
      TIMES_KEY,
      JSON.stringify([
        { ts: 1_700_000_000_000, time: 120 },
        { ts: 1_700_000_100_000, time: 95 },
        { ts: 1_700_000_200_000, time: 80 },
        { ts: 1_700_000_300_000, time: 78 },
      ]),
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
    // Locate the best-time row by its marker class (pinned at W1707).
    const bestTimeRow = panel.querySelector("li.stats-drill-best-time");
    expect(bestTimeRow).not.toBeNull();
    // The value wrapper is a direct-child <span> — distinct from the
    // bare <em> shape used by every other drill-list row.
    const valueWrap = bestTimeRow!.querySelector(":scope > span.stats-drill-value");
    expect(valueWrap).not.toBeNull();
    expect(valueWrap!.tagName).toBe("SPAN");
    // Exact className pin: any modifier addition (e.g. --with-chart) or
    // rename trips this. The CSS flex-baseline rule keys off this exact
    // hook.
    expect(valueWrap!.className).toBe("stats-drill-value");
    // Co-location proof #1: the seeded sparkline lives INSIDE the
    // wrapper, not as a loose sibling of the <em>.
    const sparkline = within(valueWrap as HTMLElement).getByTestId(
      "stats-sparkline-klondike",
    );
    expect(valueWrap!.contains(sparkline)).toBe(true);
    // Co-location proof #2: the formatted best-time <em> is also a
    // direct child of the wrapper — locking the "value+chart share a
    // wrapper" invariant the CSS depends on.
    const valueEm = valueWrap!.querySelector(":scope > em");
    expect(valueEm).not.toBeNull();
    expect(valueEm!.tagName).toBe("EM");
  });
});
