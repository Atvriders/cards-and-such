import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1756: StatsPage drill-down panel renders eight stat rows inside its
 * `stats-drill-list` `<ul>`; the SEVENTH row is "Hints used" — a
 * `<li data-testid="stats-drill-hints"><span>Hints used</span><em>{count}</em></li>`
 * shape. Existing drill-down pins cover the close button (W1256), the play
 * link className (W1666), the head wrapper className (W1676), the title
 * span className (W1685), the cat-badge className (W1697), the best-time
 * row's marker class (W1707), the Plays row's value `<em>` (W1716), the
 * Wins row's value `<em>` (W1729), and the best-time value span class
 * (W1742) — but no test asserts the Hints-used row's specific value markup.
 * The existing StatsPage suite checks that the row's textContent CONTAINS
 * "7", but doesn't pin that the value lives in a direct-child `<em>`
 * (vs a `<strong>` or wrapping `<span>`). A refactor that swaps `<em>` for
 * `<strong>`, or wraps the value in a `<span>`, would silently regress the
 * Hints-used row's typography (CSS targets `.stats-drill-list li em` for
 * emphasis) while every other drill pin keeps passing because each one
 * targets a different row, and the existing textContent check would still
 * pass because "7" would still appear inside the row. We seed hints via the
 * `cards-hints-used` localStorage key, open the drill-down, walk to the
 * row carrying the `stats-drill-hints` testid, and pin that the value sits
 * in a direct-child `<em>` whose text matches the seeded count.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage drill-down — Hints used row value <em> tag", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1756: drill-down Hints used row renders count inside a direct-child <em>", () => {
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
    // Per-game hint counter consumed by `hintsUsedFor` — mirrors the seed
    // shape in the main StatsPage suite (klondike: 7).
    localStorage.setItem(
      "cards-hints-used",
      JSON.stringify({ klondike: 7 }),
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
    // The hints row carries its own testid — use it instead of an index so
    // adding a new row at the head wouldn't quietly invalidate the pin.
    const hintsRow = within(panel).getByTestId("stats-drill-hints");
    expect(hintsRow.tagName).toBe("LI");
    // Confirm row identity by its label copy (a bare <span>, no class).
    const label = within(hintsRow).getByText("Hints used");
    expect(label.tagName).toBe("SPAN");
    // Pin the value markup: a direct-child <em> holding the seeded count.
    // This is the regression pin the existing textContent-contains check
    // can't catch — it's specifically about the <em> wrapper.
    const value = hintsRow.querySelector(":scope > em");
    expect(value).not.toBeNull();
    expect(value!.tagName).toBe("EM");
    expect(value!.textContent).toBe("7");
  });
});
