import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1666: StatsPage drill-down panel renders a "Play" call-to-action that
 * deep-links into the selected game. The link is styled as a primary
 * button via the className `"btn btn-primary stats-drill-play"` — the
 * `btn`/`btn-primary` pair pulls in the shared button look (padding,
 * radius, hover/focus rings) and the `stats-drill-play` modifier reserves
 * the page-specific layout slot inside the panel footer. Existing tests
 * pin the link's tag (`A`), its href, and its visible "Play" text, but
 * no test currently asserts the className composition. A refactor that
 * drops `btn-primary` (e.g. to a ghost variant) or renames the modifier
 * would silently regress the visual hierarchy of the drill-down while
 * every other drill-related test still passes. Pin the exact className
 * string here so any drift is surfaced loudly.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage drill-down — Play link className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1666: stats-drill-play link uses 'btn btn-primary stats-drill-play' classes", () => {
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
    const playLink = within(panel).getByTestId("stats-drill-play");
    // Pin the exact className composition.
    expect(playLink.className).toBe("btn btn-primary stats-drill-play");
  });
});
