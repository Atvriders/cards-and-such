import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1783: StatsPage drill-down panel renders eight stat rows inside its
 * `stats-drill-list` `<ul>`; the EIGHTH row is "Undos used" — a
 * `<li data-testid="stats-drill-undos"><span>Undos used</span><em>{count}</em></li>`
 * shape. Existing drill-down pins cover the close button (W1256), the play
 * link className (W1666), the head wrapper className (W1676), the title span
 * className (W1685), the cat-badge className (W1697), the best-time row's
 * marker class (W1707), the Plays row's value `<em>` (W1716), the Wins row's
 * value `<em>` (W1729), the best-time value span class (W1742), the
 * Hints-used row's value `<em>` (W1756), and the Best-score row's value
 * `<em>` (W1770) — but no test asserts the Undos-used row's specific value
 * markup. The existing StatsPage suite checks that the row's textContent
 * CONTAINS "5", but doesn't pin that the value lives in a direct-child `<em>`
 * (vs a `<strong>` or wrapping `<span>`). A refactor that swaps `<em>` for
 * `<strong>`, or wraps the value in a `<span>`, would silently regress the
 * Undos-used row's typography (CSS targets `.stats-drill-list li em` for
 * emphasis) while every other drill pin keeps passing because each one
 * targets a different row, and the existing textContent check would still
 * pass because "5" would still appear inside the row. We seed undos via the
 * `cards-undos-used` localStorage key, open the drill-down, walk to the row
 * carrying the `stats-drill-undos` testid, and pin that the value sits in a
 * direct-child `<em>` whose text matches the seeded count.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage drill-down — Undos used row value <em> tag", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1783: drill-down Undos used row renders count inside a direct-child <em>", () => {
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
    // Per-game undo counter consumed by `undosUsedFor` — mirrors the seed
    // shape in the main StatsPage suite (klondike: 5).
    localStorage.setItem(
      "cards-undos-used",
      JSON.stringify({ klondike: 5 }),
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
    // The undos row carries its own testid — use it instead of an index so
    // adding a new row at the head wouldn't quietly invalidate the pin.
    const undosRow = within(panel).getByTestId("stats-drill-undos");
    expect(undosRow.tagName).toBe("LI");
    // Confirm row identity by its label copy (a bare <span>, no class).
    const label = within(undosRow).getByText("Undos used");
    expect(label.tagName).toBe("SPAN");
    // Pin the value markup: a direct-child <em> holding the seeded count.
    // This is the regression pin the existing textContent-contains check
    // can't catch — it's specifically about the <em> wrapper.
    const value = undosRow.querySelector(":scope > em");
    expect(value).not.toBeNull();
    expect(value!.tagName).toBe("EM");
    expect(value!.textContent).toBe("5");
  });
});
