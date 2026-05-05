import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2067: Each hour-of-day bar `<g data-testid="stats-hour-bar-{hr}">` is
 * identified solely by its `data-testid` plus `data-count` / `data-peak`
 * markers — it carries NO `id` attribute. Sibling hour-bar tests pin the
 * inner rect's tagName (W1873), corner-radius `rx="2"` (W1284), peak-bar
 * amber `fill` (W1335), per-bar `data-count` (W715), `data-peak` (W353),
 * the chart-level `aria-label` / `data-peak-hour` / `data-total` markers,
 * and the axis baseline stroke (W1356) — but none asserts the absence of
 * an `id` attribute on the bar group itself. Adding an `id` (e.g. for
 * anchor scrolling or external CSS targeting) on a 24-bar repeated SVG
 * group would produce duplicate-id collisions across charts and pollute
 * the document id namespace; this test pins the current id-free contract
 * so a future refactor can't silently introduce that footgun. Seed one
 * klondike play yesterday in hour-bucket 10 so the chart populates and
 * assert that bar's `hasAttribute("id") === false`.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage hour-of-day — bar group has no id attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2067: stats-hour-bar <g> carries no `id` attribute", () => {
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
    expect(barGroup.hasAttribute("id")).toBe(false);
  });
});
