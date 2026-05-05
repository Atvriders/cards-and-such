import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1716: StatsPage drill-down panel renders eight stat rows inside its
 * `stats-drill-list` `<ul>`; the FIRST row is "Plays" — a plain
 * `<li><span>Plays</span><em>{count}</em></li>` shape (no marker class, no
 * inner sparkline wrapper, unlike the best-time row at W1707). Existing
 * drill-down tests pin the close-button aria-label (W1256), the play link
 * className (W1666), the head wrapper className (W1676), the title span
 * className (W1685), the cat-badge className (W1697), the best-time row's
 * `<li class="stats-drill-best-time">` marker (W1707), and the list ul
 * className (W1653) — but no test currently asserts the structural shape of
 * a NON-best-time inner stat row. The Plays row is the canonical baseline:
 * a refactor that swaps `<em>` for `<strong>` (or wraps the value in a
 * `<span>`) would silently regress every plain stat row's typography (CSS
 * targets `.stats-drill-list li em` for emphasis) while the best-time pin
 * would keep passing because that row uses a different DOM. We open the
 * drill-down via the only seeded game, walk to the first `<li>` of the
 * drill-list, and pin that the value sits in a direct-child `<em>` whose
 * text matches the seeded `played` count. This locks the simplest stat
 * row's shape against quiet refactors of the value markup.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage drill-down — Plays row value <em> tag", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1716: drill-down first stat row renders Plays value inside a direct-child <em>", () => {
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
    // Walk from the panel down to the drill-list ul. We use a child query
    // here because the list is the only direct content carrier.
    const list = panel.querySelector("ul.stats-drill-list");
    expect(list).not.toBeNull();
    // First direct-child <li> is the Plays row (Plays / Wins / Best score
    // / Best time / Last played / Your rating / Hints used / Undos used).
    const firstRow = list!.querySelector(":scope > li");
    expect(firstRow).not.toBeNull();
    expect(firstRow!.tagName).toBe("LI");
    // Sanity: this row is NOT the best-time row — best-time uses a marker
    // className that the plain Plays row deliberately omits. This is the
    // distinguishing line between W1707 and this pin.
    expect(firstRow!.className).toBe("");
    // Confirm row identity by its label copy.
    const label = within(firstRow as HTMLElement).getByText("Plays");
    expect(label.tagName).toBe("SPAN");
    // Pin the value markup: a direct-child <em> holding the seeded count.
    const value = firstRow!.querySelector(":scope > em");
    expect(value).not.toBeNull();
    expect(value!.tagName).toBe("EM");
    expect(value!.textContent).toBe("12");
  });
});
