import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1676: StatsPage drill-down panel groups its category badge, title, and
 * close button inside a single header row marked by `<div className=
 * "stats-drill-head">`. The CSS for this class lays out those three
 * children with flex-row spacing, vertical alignment, and the trailing
 * close-button gap. Existing drill-down tests pin the surrounding
 * `stats-drill-panel` wrapper (W1653/W1666), the close-button aria-label
 * (W1256), the play-link className (W1666), and the body `<ul
 * className="stats-drill-list">` (W1653) — but no test currently asserts
 * the wrapper className on the header itself. A refactor that renamed
 * `stats-drill-head` to `stats-drill-header` (or split the badge into a
 * separate row) would silently break the header layout while every other
 * drill-down test continued to pass. We open the drill-down by clicking a
 * top-played bar, then pin that the close button's parent element is a
 * `<div>` whose className is exactly `"stats-drill-head"`.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage drill-down — stats-drill-head wrapper div className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1676: drill-down header wrapper is a <div class='stats-drill-head'>", () => {
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
    const close = within(panel).getByTestId("stats-drill-close");
    // The close button lives inside the header wrapper.
    const head = close.parentElement;
    expect(head).not.toBeNull();
    expect(head!.tagName).toBe("DIV");
    expect(head!.className).toBe("stats-drill-head");
    // Sanity: the head is a direct child of the drill panel.
    expect(head!.parentElement).toBe(panel);
  });
});
