import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1418: The "Top played" bar chart wraps each bar in a `<g>` that carries the
 * `stats-drill-<id>` testid AND — because the chart is rendered with an
 * `onSelect` handler so users can click bars to drill down — an inline
 * `style="cursor: pointer"` so the affordance is visible on hover. W1277
 * pinned the rect `rx`, W1378 pinned the rect fill, W1349 pinned the value
 * text-anchor, W1401 pinned the value font-size, W1310 pinned the chart
 * viewBox, W1203 pinned the subtitle, W1256 pinned the drill-close aria, but
 * no existing test asserts the cursor affordance on the bar group itself. A
 * refactor that drops the inline style (e.g. moves cursor into a CSS class,
 * forgets the `clickable` branch, or removes `onSelect` and accidentally
 * leaves the group non-interactive) would silently regress the click
 * affordance while every other Top played test still passes. We seed a single
 * play so the chart renders one bar, then pin the bar group's inline
 * `cursor: pointer` style scoped to that group.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage top-played — bar group cursor affordance", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1418: top-played bar group carries inline cursor:pointer style", () => {
    localStorage.setItem(
      STATS_KEY,
      JSON.stringify({
        totalPlayed: 4,
        totalWins: 2,
        longestStreak: 0,
        currentStreak: 0,
        perGame: {
          klondike: { played: 4, wins: 2, best: 300 },
        },
        perCategory: { solitaire: 4 },
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

    const barGroup = screen.getByTestId("stats-drill-klondike");
    expect((barGroup as SVGGElement).style.cursor).toBe("pointer");
  });
});
