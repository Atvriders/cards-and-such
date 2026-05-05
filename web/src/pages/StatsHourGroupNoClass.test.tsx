import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2470: Each hour-of-day bar in the StatsPage hour chart is rendered as
 * an SVG `<g data-testid="stats-hour-bar-{hr}">` group with NO
 * `className` / `class` attribute — styling is applied solely on the
 * inner `<rect>` (fill color) and on the chart-level wrapper. Sibling
 * hour-bar tests already pin the group's tagName as `g` (W2461),
 * absence of `id` (W2067) and `tabindex` (W2275), the per-bar
 * `data-count` (W715) and `data-peak` (W353) markers, plus the inner
 * rect's `rx="2"` corner radius (W1284) and peak/non-peak fill colors
 * (W1335, W2404) — but none asserts the absence of a `class` attribute
 * on the bar group itself. Bolting a `class="..."` onto the repeating
 * `<g>` would couple the SVG markup to a CSS selector contract (24 bar
 * groups would suddenly become a CSS-targetable surface), invite
 * theme-specific styling that bypasses the inline `fill` invariants,
 * and risk visual regressions when global stylesheets ship a colliding
 * class name. This test pins the current class-free contract so a
 * future refactor can't silently introduce that coupling. Seed one
 * klondike play yesterday in hour-bucket 10 so the chart populates and
 * assert that bar's `hasAttribute("class") === false`.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage hour-of-day — bar group has no class attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2470: stats-hour-bar <g> carries no `class` attribute", () => {
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
    expect(barGroup.hasAttribute("class")).toBe(false);
  });
});
