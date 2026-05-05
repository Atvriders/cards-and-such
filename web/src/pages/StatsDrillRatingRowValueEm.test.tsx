import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1804: StatsPage drill-down panel renders eight stat rows inside its
 * `stats-drill-list` `<ul>`; the SIXTH row is "Your rating" — a plain
 * `<li><span>Your rating</span><em>{rating || "—"}</em></li>` shape with
 * no marker class, no sparkline wrapper (unlike the best-time row at
 * W1707), and no `data-testid` (unlike hints at W1756 and undos at
 * W1783). Existing drill pins cover the close button (W1256), play link
 * (W1666), head wrapper (W1676), title span (W1685), cat badge (W1697),
 * best-time `<li>` marker (W1707), Plays value `<em>` (W1716), Wins
 * value `<em>` (W1729), best-time inner value `<span>` (W1742), Hints
 * value `<em>` (W1756), Best score value `<em>` (W1770), Undos value
 * `<em>` (W1783), and Last played value `<em>` (W1794) — but no test
 * asserts the "Your rating" row's specific markup. A refactor that
 * swaps `<em>` for `<strong>`, wraps the value in a `<span>`, or drops
 * the bare `<span>` label would silently regress how the per-game star
 * rating renders (CSS targets `.stats-drill-list li em` for emphasis)
 * while every other drill pin keeps passing because each one targets a
 * different row. We deliberately leave the `cards-ratings` map unset
 * so `ratingFor` returns null and the row falls back to the em-dash
 * placeholder ("—"), which is the canonical "no rating yet" rendering
 * for any newly-seeded game. We open the drill-down, walk to the sixth
 * `<li>` of the drill-list, and pin that the value sits in a direct-
 * child `<em>` whose text matches the placeholder. This locks the
 * Your-rating row's shape independently from sibling-row pins and from
 * the rating-formatter logic.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage drill-down — Your rating row value <em> tag", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1804: drill-down sixth stat row renders Your rating value inside a direct-child <em>", () => {
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
    // The Your-rating row is the SIXTH direct-child <li>
    // (Plays / Wins / Best score / Best time / Last played / Your rating /
    // Hints used / Undos used).
    const rows = list!.querySelectorAll(":scope > li");
    expect(rows.length).toBeGreaterThanOrEqual(6);
    const ratingRow = rows[5] as HTMLElement;
    expect(ratingRow.tagName).toBe("LI");
    // Sanity: this row is NOT the best-time row — best-time uses a marker
    // className that the plain Your-rating row deliberately omits. Keeps
    // W1804 distinct from W1707's marker pin.
    expect(ratingRow.className).toBe("");
    // Confirm row identity by its label copy (a bare <span>, no class).
    const label = within(ratingRow).getByText("Your rating");
    expect(label.tagName).toBe("SPAN");
    // Pin the value markup: a direct-child <em> holding the placeholder
    // (no `cards-ratings` map seeded → ratingFor → null → "—").
    const value = ratingRow.querySelector(":scope > em");
    expect(value).not.toBeNull();
    expect(value!.tagName).toBe("EM");
    expect(value!.textContent).toBe("—");
  });
});
