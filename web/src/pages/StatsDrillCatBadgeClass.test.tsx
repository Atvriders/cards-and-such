import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1697: StatsPage drill-down panel renders the selected game's category as
 * a badge inside the header row using the shared `play-category` class plus
 * a `play-category--<category>` modifier. The CSS for these classes controls
 * the badge's color/shape and is shared with the rest of the app. Existing
 * drill-down tests pin the close-button aria-label (W1256), the play-link
 * className (W1666), the header wrapper className (W1676), and the title
 * span className (W1685) — but no test currently asserts the category badge
 * span's own classes. A refactor that dropped the `play-category` base class
 * (e.g. inlining a one-off `drill-cat` class) would silently break the
 * badge's shared styling while every other drill-down test continued to
 * pass. We open the drill-down by clicking a top-played bar for a known
 * solitaire-category game (`klondike`), then pin that the first child of
 * the head is a `<span>` whose classList contains both `play-category` and
 * `play-category--solitaire`, and whose textContent is the category name.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage drill-down — category badge className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1697: drill-down category is a <span> with play-category + play-category--solitaire classes", () => {
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

    fireEvent.click(screen.getByTestId("stats-drill-klondike"));
    const panel = screen.getByTestId("stats-drill-panel");
    const close = within(panel).getByTestId("stats-drill-close");
    const head = close.parentElement!;
    // Category badge is the first child span in the head row.
    const badge = head.querySelector("span.play-category");
    expect(badge).not.toBeNull();
    expect(badge!.tagName).toBe("SPAN");
    expect(badge!.classList.contains("play-category")).toBe(true);
    expect(badge!.classList.contains("play-category--solitaire")).toBe(true);
    expect(badge!.textContent).toBe("solitaire");
  });
});
