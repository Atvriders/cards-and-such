import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1770: StatsPage drill-down panel renders eight stat rows inside its
 * `stats-drill-list` `<ul>`; the THIRD row is "Best score" — a plain
 * `<li><span>Best score</span><em>{best || "—"}</em></li>` shape with no
 * marker class, no inner sparkline wrapper (unlike the best-time row at
 * W1707), and no `data-testid` like hints/undos at the tail of the list.
 * Existing drill-down pins cover the close button (W1256), the play link
 * className (W1666), the head wrapper className (W1676), the title span
 * className (W1685), the cat-badge className (W1697), the best-time `<li>`
 * marker class (W1707), the Plays row's value `<em>` (W1716), the Wins
 * row's value `<em>` (W1729), the best-time inner value `<span>` className
 * (W1742), and the Hints row's value `<em>` (W1756) — but no test asserts
 * the Best-score row's specific markup, even though it backs the per-game
 * best score displayed in the drill-down. A refactor that swaps `<em>` for
 * `<strong>`, wraps the value in a `<span>`, or drops the bare `<span>`
 * label would silently regress how the best-score number renders (CSS
 * targets `.stats-drill-list li em` for emphasis) while every other drill
 * pin keeps passing because each one targets a different row. We seed a
 * single game with a known `best`, open the drill-down, walk to the third
 * `<li>` of the drill-list, and pin that the value sits in a direct-child
 * `<em>` whose text matches the seeded `best` number. This locks the Best
 * score row's shape independently from the sibling-row pins.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage drill-down — Best score row value <em> tag", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1770: drill-down third stat row renders Best score value inside a direct-child <em>", () => {
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
    const list = panel.querySelector("ul.stats-drill-list");
    expect(list).not.toBeNull();
    // The Best-score row is the THIRD direct-child <li>
    // (Plays / Wins / Best score / Best time / Last played / Your rating /
    // Hints used / Undos used).
    const rows = list!.querySelectorAll(":scope > li");
    expect(rows.length).toBeGreaterThanOrEqual(3);
    const bestScoreRow = rows[2] as HTMLElement;
    expect(bestScoreRow.tagName).toBe("LI");
    // Sanity: this row is NOT the best-time row — best-time uses a marker
    // className that the plain Best-score row deliberately omits. Keeps
    // W1770 distinct from W1707's marker pin.
    expect(bestScoreRow.className).toBe("");
    // Confirm row identity by its label copy (a bare <span>, no class).
    const label = within(bestScoreRow).getByText("Best score");
    expect(label.tagName).toBe("SPAN");
    // Pin the value markup: a direct-child <em> holding the seeded best.
    const value = bestScoreRow.querySelector(":scope > em");
    expect(value).not.toBeNull();
    expect(value!.tagName).toBe("EM");
    expect(value!.textContent).toBe("300");
  });
});
