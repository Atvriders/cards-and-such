import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1349: Each bar group in the "Top played" chart contains two `<text>` nodes
 * — a category label below the baseline and a numeric play-count value above
 * the bar — and both are horizontally centered above the rect via
 * `text-anchor="middle"`. Prior tests pin the chart-level role/aria-label
 * (W1224), the "Click a bar to see details" subtitle (W1203), the bar rect
 * `rx="3"` corner-radius (W1277), the SVG viewBox (W1310), and the
 * drill-close button's aria-label (W1256), but none assert that the value
 * label sitting above each bar is centered. A refactor that drops the
 * `textAnchor`, switches to `start`/`end`, or hoists alignment into CSS
 * would silently shift the count off-center while every other Top played
 * test still passes. We seed a single play so one bar renders, then pin
 * the value label's `text-anchor="middle"` scoped to that bar's group.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage top-played — bar value label anchor", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1349: top-played bar value label uses text-anchor='middle'", () => {
    localStorage.setItem(
      STATS_KEY,
      JSON.stringify({
        totalPlayed: 7,
        totalWins: 3,
        longestStreak: 0,
        currentStreak: 0,
        perGame: {
          klondike: { played: 7, wins: 3, best: 300 },
        },
        perCategory: { solitaire: 7 },
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
    const texts = Array.from(barGroup.querySelectorAll("text"));
    const valueLabel = texts.find((t) => t.textContent === "7");
    expect(valueLabel).toBeDefined();
    expect(valueLabel!.getAttribute("text-anchor")).toBe("middle");
  });
});
