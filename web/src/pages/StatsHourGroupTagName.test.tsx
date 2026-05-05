import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2461: Each hour-of-day bar in the StatsPage hour chart is rendered as
 * an SVG `<g>` group element keyed by `data-testid="stats-hour-bar-{hr}"`.
 * Sibling hour-bar tests pin the group's `data-peak` / `data-count`
 * markers, the absence of `id` (W2067) and `tabindex` (W2275), the inner
 * rect's corner-radius `rx="2"` (W1284), the peak (W1335) and non-peak
 * fill colors, and the chart-baseline stroke — but none asserts the
 * tagName of the group element itself. Switching from `<g>` to e.g. a
 * `<svg>` or HTML `<div>` would silently break SVG composition (transforms,
 * stroke inheritance, layout) on every consumer of the chart. This test
 * pins the contract that the testid-bearing wrapper is an SVG `<g>`. Seed
 * one klondike play yesterday in hour-bucket 10 so the chart populates,
 * then assert the bar group's `tagName.toLowerCase() === "g"`.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage hour-of-day — bar group element is an SVG <g>", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2461: stats-hour-bar wrapper has tagName 'g'", () => {
    // Anchor a single play to a fixed local hour YESTERDAY so DST / timezone
    // offsets don't shift the bucket and the future-skew filter (ts > now)
    // doesn't drop it on early-morning suite runs.
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(10, 0, 0, 0);
    const ts = d.getTime();

    localStorage.setItem(
      STATS_KEY,
      JSON.stringify({
        totalPlayed: 1,
        totalWins: 1,
        longestStreak: 1,
        currentStreak: 1,
        perGame: {
          klondike: { played: 1, wins: 1, best: 60 },
        },
        perCategory: { solitaire: 1 },
        daysPlayed: [],
        unlocked: [],
      }),
    );
    localStorage.setItem(
      "cards-time-history:klondike",
      JSON.stringify([{ ts, time: 60 }]),
    );

    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const barGroup = screen.getByTestId("stats-hour-bar-10");
    expect(barGroup.tagName.toLowerCase()).toBe("g");
  });
});
