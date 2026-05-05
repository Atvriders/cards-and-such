import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2085: StatsPage drill-down panel root `<div className="stats-drill-panel"
 * data-testid="stats-drill-panel">` is intentionally rendered WITHOUT an `id`
 * attribute. The panel is selected via its `className` (for CSS) and
 * `data-testid` (for tests); it must not carry an `id` because the panel can
 * be opened/closed many times in a session as the user clicks different bars,
 * and a fixed `id` would risk duplicate-id violations if the rendering is
 * ever duplicated (e.g. via a future side-by-side compare view) or used
 * inside a portal alongside another StatsPage instance. Existing drill-down
 * tests pin the panel's tagName and className (W1817), the head wrapper
 * (W1676), the close button (W1256), the list `<ul>` class (W1653), and
 * various row `<em>` values — but none assert that the panel root has no
 * `id`. A refactor that added `id="stats-drill-panel"` (e.g. for an aria-
 * controls hookup) would silently violate this invariant while every other
 * drill-down test continued to pass. We open the drill-down by clicking the
 * only seeded top-played bar, then pin that the panel root has no `id`.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage drill-down — stats-drill-panel root has no id", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2085: drill-down panel root <div> has no id attribute", () => {
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
    expect(panel.hasAttribute("id")).toBe(false);
  });
});
