import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1277: The "Top played" bar chart renders each bar as a `<g>` (carrying the
 * `stats-drill-<id>` testid) wrapping a `<rect>` whose visual silhouette is
 * defined by `rx="3"` — the small corner-rounding that makes the bars
 * pill-tipped instead of harshly square. W1224 pinned the chart SVG's
 * role/aria-label, W1203 pinned the "Click a bar to see details" subtitle,
 * and W1256 pinned the drill-close button's aria-label, but no existing test
 * asserts the corner-radius on the bar rect itself. A refactor that drops
 * the `rx`, switches to `ry`, hoists rounding into CSS, or changes the
 * radius value (e.g. `rx="6"` for a chunkier look) would silently regress
 * the bar's visual contract while every other Top played test still passes.
 * We seed a single play so the chart renders one bar, then pin the rect's
 * `rx="3"` corner-radius scoped to that bar's group.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage top-played — bar rect corner-radius", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1277: top-played bar rect carries rx='3' corner-radius", () => {
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
    const rect = barGroup.querySelector("rect");
    expect(rect).not.toBeNull();
    expect(rect!.getAttribute("rx")).toBe("3");
  });
});
