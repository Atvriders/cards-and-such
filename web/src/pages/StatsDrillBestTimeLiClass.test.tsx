import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1707: StatsPage drill-down panel renders the "Best time" stat row as a
 * special `<li className="stats-drill-best-time">` inside the
 * `stats-drill-list` body. This class is what differentiates that row from
 * its siblings: the CSS uses it to opt the row into a multi-element layout
 * that holds the inline `<Sparkline>` next to the formatted time value
 * (wrapped in `stats-drill-value`). Existing drill-down tests pin the close
 * button aria-label (W1256), the play link className (W1666), the head
 * wrapper className (W1676), the title span className (W1685), and the
 * cat-badge className (W1697) — but no test currently asserts that the
 * best-time row's `<li>` carries the `stats-drill-best-time` class. A
 * refactor that dropped or renamed this class (e.g. inlining the Sparkline
 * without a marker class, or moving the marker to the inner span) would
 * silently break the row's grid/flex styling while every other drill-down
 * test continued to pass. We open the drill-down by clicking a top-played
 * bar, then pin that the panel contains exactly one `<li>` whose className
 * is `"stats-drill-best-time"`, that it lives inside the `stats-drill-list`
 * `<ul>`, and that it begins with a "Best time" label.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage drill-down — stats-drill-best-time li className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1707: drill-down best-time row is a <li class='stats-drill-best-time'>", () => {
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
    // Find the best-time list item by its class.
    const list = panel.querySelector("ul.stats-drill-list");
    expect(list).not.toBeNull();
    const bestTimeRow = list!.querySelector("li.stats-drill-best-time");
    expect(bestTimeRow).not.toBeNull();
    expect(bestTimeRow!.tagName).toBe("LI");
    expect(bestTimeRow!.className).toBe("stats-drill-best-time");
    // Sanity: parent is the drill-list ul.
    expect(bestTimeRow!.parentElement).toBe(list);
    // Sanity: row labels itself "Best time".
    const label = within(bestTimeRow as HTMLElement).getByText("Best time");
    expect(label.tagName).toBe("SPAN");
  });
});
