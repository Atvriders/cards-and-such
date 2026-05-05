import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2377: StatsPage drill-down panel root `<div className="stats-drill-panel"
 * data-testid="stats-drill-panel">` is intentionally rendered WITHOUT an
 * inline `style` attribute. All visual layout for the drill-down panel is
 * delegated to the `stats-drill-panel` CSS class (defined in
 * StatsPage.css), so the rendered DOM should never carry per-instance
 * inline styles — that would make the panel diverge from the documented
 * stylesheet contract and undermine theme overrides. Existing drill-down
 * tests pin the panel's tagName and className (W1817), the absence of `id`
 * (W2085), the absence of `tabindex` (W2286), the head wrapper (W1676),
 * the close button (W1256), the list `<ul>` class (W1653), and various
 * row `<em>` values — but none assert that the panel root has no inline
 * `style` attribute. A refactor that injected `style={{ display: ... }}`
 * or computed positioning onto the panel root (e.g. an attempt to anchor
 * it to the clicked bar) would silently violate the stylesheet-only
 * contract while every other drill-down test continued to pass. We open
 * the drill-down by clicking the only seeded top-played bar, then pin
 * that the panel root has no `style` attribute.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage drill-down — stats-drill-panel root has no inline style", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2377: drill-down panel root <div> has no style attribute", () => {
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
    expect(panel.hasAttribute("style")).toBe(false);
  });
});
