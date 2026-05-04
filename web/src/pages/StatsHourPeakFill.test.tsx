import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1335: The hour-of-day chart recolors its peak bar's inner `<rect>` with
 * `fill="#fbbf24"` (amber) so the busiest hour stands out from the violet
 * `#a78bfa` shaft used by every other hour. Existing hour-chart coverage
 * pins the bar's structural attributes — `data-peak` (W353), per-bar
 * `data-count` (W715), corner-radius `rx="2"` (W1284), tick `text-anchor`
 * (W1289), the chart-level `data-peak-hour` / `data-total`, and the empty-
 * state subtitle (W1232) — but no test asserts the actual peak fill color.
 * A refactor that hoists fill into CSS, swaps to a CSS variable, drops the
 * highlight, or quietly changes the amber would silently regress the
 * visual contract. We seed one klondike play in a fixed hour-10 bucket so
 * the chart picks that as its peak, then assert the rect's fill.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage hour-of-day — peak bar fill color", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1335: stats-hour-bar peak rect uses fill='#fbbf24' amber highlight", () => {
    // Anchor a single play to hour 10 yesterday so DST / timezone offsets
    // don't shift the bucket and the future-skew filter (ts > now) keeps it.
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

    // The seeded play is the only sample, so hour 10 is the peak bucket.
    const barGroup = screen.getByTestId("stats-hour-bar-10");
    expect(barGroup.getAttribute("data-peak")).toBe("true");
    const rect = barGroup.querySelector("rect");
    expect(rect).not.toBeNull();
    expect(rect!.getAttribute("fill")).toBe("#fbbf24");
  });
});
