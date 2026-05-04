import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1289: The hour-of-day chart prints x-axis tick labels every six hours
 * (0, 6, 12, 18, plus 23 as the right-edge bookend). Each tick is a `<text>`
 * node whose `text-anchor="middle"` keeps the digit centered under the
 * corresponding bar — without it, multi-digit labels like "12" and "18"
 * drift left and visibly desync from their bars. Existing hour-chart
 * coverage pins the chart-level subtitle (W1232), card structure (W1263),
 * the per-bar rect corner-radius (W1284), `data-peak` (W353), and
 * `data-count` (W715) — but no test asserts the tick label's anchor.
 * A refactor that drops `textAnchor`, swaps to `start`/`end`, or hoists
 * the centering into CSS (which won't apply to SVG `<text>` the same way)
 * would silently regress the axis layout. We seed one klondike play so
 * the chart renders, then scope to the `0` tick label and pin the anchor.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage hour-of-day — tick label anchor", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1289: hour-of-day '0' tick label uses text-anchor='middle'", () => {
    // Anchor a play YESTERDAY at a non-zero hour so the chart populates
    // without mutating the `0` tick label we're inspecting (the labels
    // print regardless of counts, but a non-empty chart guarantees the
    // SVG isn't replaced by an empty-state div).
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

    const chart = screen.getByTestId("stats-hour-chart");
    // Tick labels are SVG <text> children of the chart. Find the one that
    // prints "0" (the midnight bucket — first labeled tick on the axis).
    const labels = Array.from(chart.querySelectorAll("text"));
    const zeroLabel = labels.find((t) => t.textContent === "0");
    expect(zeroLabel).toBeDefined();
    expect(zeroLabel!.getAttribute("text-anchor")).toBe("middle");
  });
});
