import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1378: Each bar in the "Top played" chart fills its rect with the brand
 * violet `#a78bfa` when not selected (and only flips to the lighter
 * `#c7cdfe` highlight when the user drills into that game). Prior tests
 * pin the chart-level role/aria-label (W1224), the "Click a bar to see
 * details" subtitle (W1203), the bar rect `rx="3"` corner-radius (W1277),
 * the SVG viewBox (W1310), the value label `text-anchor="middle"` (W1349),
 * and the drill-close button's aria-label (W1256), but none assert the
 * bar's resting fill color. A refactor that swaps the palette, drops the
 * inline fill in favor of CSS, or accidentally always renders the active
 * highlight would silently change the chart's brand color while every
 * other Top played test still passes. We seed a single play so one bar
 * renders (with no drill selected) and pin the rect's `fill="#a78bfa"`.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage top-played — bar resting fill color", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1378: top-played bar rect carries fill='#a78bfa' when not selected", () => {
    localStorage.setItem(
      STATS_KEY,
      JSON.stringify({
        totalPlayed: 5,
        totalWins: 2,
        longestStreak: 0,
        currentStreak: 0,
        perGame: {
          klondike: { played: 5, wins: 2, best: 300 },
        },
        perCategory: { solitaire: 5 },
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
    expect(rect!.getAttribute("fill")).toBe("#a78bfa");
  });
});
