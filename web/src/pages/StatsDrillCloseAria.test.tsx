import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1256: StatsPage drill-down panel renders a close button (the small "×"
 * top-right of the panel header) whose accessible name is carried entirely
 * by `aria-label="Close drill-down"`. The button has no visible text label
 * — only the multiplication-sign glyph as content — so screen-reader users
 * rely on the aria-label to know what the control does. Existing tests
 * pin `data-testid="stats-drill-panel"`, the inner hint/undo rows, the
 * play link, and the toggle behaviour, but no test currently asserts the
 * close button's aria-label string. A copy-edit that drops or rewords the
 * aria-label (e.g. to a generic "Close") would silently regress the
 * panel's a11y story while every other drill-down test still passes. We
 * open the drill-down by clicking a top-played bar, then pin the exact
 * aria-label on the close button scoped to the drill panel.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage drill-down — close button aria-label", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1256: stats-drill-close button exposes aria-label='Close drill-down'", () => {
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
    // Pin the exact aria-label string — it's the sole accessible name.
    expect(close.getAttribute("aria-label")).toBe("Close drill-down");
    // Sanity: the close control is in fact a <button>.
    expect(close.tagName).toBe("BUTTON");
  });
});
