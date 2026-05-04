import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1401: Each bar group in the "Top played" chart renders a numeric value
 * label above the rect as an inline-styled `<text fontSize="9">` node — the
 * tiny 9-unit type size is what keeps the count from overflowing the narrow
 * column width inside the 320×140 SVG viewBox. Prior tests pin the bar
 * rect `rx="3"` corner-radius (W1277), the SVG viewBox (W1310), the value
 * label `text-anchor="middle"` (W1349), and the resting fill `#a78bfa`
 * (W1378), but none assert the value label's font-size. A refactor that
 * drops the inline `fontSize` in favor of CSS, bumps it up to fit a different
 * layout, or removes it entirely would silently change the chart's compact
 * type scale while every other Top played test still passes. We seed a
 * single play so one bar renders, then pin the value label's
 * `font-size="9"` scoped to that bar's group.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage top-played — bar value label font size", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1401: top-played bar value label carries font-size='9'", () => {
    localStorage.setItem(
      STATS_KEY,
      JSON.stringify({
        totalPlayed: 4,
        totalWins: 1,
        longestStreak: 0,
        currentStreak: 0,
        perGame: {
          klondike: { played: 4, wins: 1, best: 300 },
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
    const texts = Array.from(barGroup.querySelectorAll("text"));
    const valueLabel = texts.find((t) => t.textContent === "4");
    expect(valueLabel).toBeDefined();
    expect(valueLabel!.getAttribute("font-size")).toBe("9");
  });
});
