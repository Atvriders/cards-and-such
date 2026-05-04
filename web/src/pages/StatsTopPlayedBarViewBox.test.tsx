import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1310: The "Top played" bar chart SVG (testid `stats-bar-chart`) carries a
 * fixed `viewBox="0 0 320 140"` so its internal coordinate system stays stable
 * regardless of the SVG's rendered CSS box. W1224 pinned the chart's
 * role/aria-label, W1277 pinned the bar rect's `rx="3"` corner-radius, and
 * W1203 pinned the "Click a bar to see details" subtitle, but no existing
 * test asserts the chart's viewBox. A refactor that resizes the chart
 * (e.g. `0 0 480 200`), drops the viewBox in favour of width/height
 * attributes, or switches to a `preserveAspectRatio` shim would silently
 * regress every coordinate the bars/labels are computed against — the
 * chart would still render, but its proportions and label placement would
 * drift. We seed a single play so the chart renders, then pin the SVG's
 * viewBox attribute.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage top-played — bar chart SVG viewBox", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1310: stats-bar-chart SVG carries viewBox='0 0 320 140'", () => {
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

    const chart = screen.getByTestId("stats-bar-chart");
    expect(chart.tagName.toLowerCase()).toBe("svg");
    expect(chart.getAttribute("viewBox")).toBe("0 0 320 140");
  });
});
