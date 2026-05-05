import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1794: StatsPage drill-down panel renders eight stat rows inside its
 * `stats-drill-list` `<ul>`; the FIFTH row is "Last played" — a plain
 * `<li><span>Last played</span><em>{relTime || "—"}</em></li>` shape with
 * no marker class, no sparkline wrapper (unlike the best-time row at
 * W1707), and no `data-testid` (unlike hints at W1756 and undos at W1783).
 * Existing drill-down pins cover the close button (W1256), the play link
 * className (W1666), the head wrapper className (W1676), the title span
 * className (W1685), the cat-badge className (W1697), the best-time `<li>`
 * marker class (W1707), the Plays row's value `<em>` (W1716), the Wins
 * row's value `<em>` (W1729), the best-time inner value `<span>` className
 * (W1742), the Hints row's value `<em>` (W1756), the Best score row's
 * value `<em>` (W1770), and the Undos row's value `<em>` (W1783) — but
 * no test asserts the Last-played row's specific markup, even though it
 * backs the per-game recency hint shown in the drill-down. A refactor
 * that swaps `<em>` for `<strong>`, wraps the value in a `<span>`, or
 * drops the bare `<span>` label would silently regress how the recency
 * timestamp renders (CSS targets `.stats-drill-list li em` for emphasis)
 * while every other drill pin keeps passing because each one targets a
 * different row. We deliberately leave the `cards-last-played` map unset
 * so `lastPlayedFor` returns null and the row falls back to the em-dash
 * placeholder ("—"), which is the canonical "no data yet" rendering for
 * any newly-seeded game and the path most users hit on first visit. We
 * open the drill-down, walk to the fifth `<li>` of the drill-list, and
 * pin that the value sits in a direct-child `<em>` whose text matches
 * the placeholder. This locks the Last-played row's shape independently
 * from sibling-row pins and from the relative-time formatter logic.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage drill-down — Last played row value <em> tag", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1794: drill-down fifth stat row renders Last played value inside a direct-child <em>", () => {
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
    // The Last-played row is the FIFTH direct-child <li>
    // (Plays / Wins / Best score / Best time / Last played / Your rating /
    // Hints used / Undos used).
    const rows = list!.querySelectorAll(":scope > li");
    expect(rows.length).toBeGreaterThanOrEqual(5);
    const lastPlayedRow = rows[4] as HTMLElement;
    expect(lastPlayedRow.tagName).toBe("LI");
    // Sanity: this row is NOT the best-time row — best-time uses a marker
    // className that the plain Last-played row deliberately omits. Keeps
    // W1794 distinct from W1707's marker pin.
    expect(lastPlayedRow.className).toBe("");
    // Confirm row identity by its label copy (a bare <span>, no class).
    const label = within(lastPlayedRow).getByText("Last played");
    expect(label.tagName).toBe("SPAN");
    // Pin the value markup: a direct-child <em> holding the placeholder
    // (no `cards-last-played` map seeded → lastPlayedFor → null → "—").
    const value = lastPlayedRow.querySelector(":scope > em");
    expect(value).not.toBeNull();
    expect(value!.tagName).toBe("EM");
    expect(value!.textContent).toBe("—");
  });
});
