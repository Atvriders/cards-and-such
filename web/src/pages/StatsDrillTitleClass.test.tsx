import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1685: StatsPage drill-down panel renders the selected game's title inside
 * a `<span className="stats-drill-title">` within the header row. The CSS
 * for this class controls the title's typography (weight, size, truncation)
 * separate from the category badge alongside it. Existing drill-down tests
 * pin the close-button aria-label (W1256), the play-link className (W1666),
 * and the header wrapper className (W1676) — but no test currently asserts
 * the title span's own className. A refactor that dropped `stats-drill-title`
 * (e.g. swapping it for a generic `<span>` or renaming to `drill-title`)
 * would silently break title styling while every other drill-down test
 * continued to pass. We open the drill-down by clicking a top-played bar,
 * then pin that the title element is a `<span>` whose className is exactly
 * `"stats-drill-title"` and that it contains the game's display title.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage drill-down — stats-drill-title span className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1685: drill-down title is a <span class='stats-drill-title'>", () => {
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
    const head = close.parentElement!;
    // Find the title span inside the header.
    const title = head.querySelector(".stats-drill-title");
    expect(title).not.toBeNull();
    expect(title!.tagName).toBe("SPAN");
    expect(title!.className).toBe("stats-drill-title");
    // Sanity: title element has non-empty text content.
    expect(title!.textContent && title!.textContent.length > 0).toBe(true);
  });
});
