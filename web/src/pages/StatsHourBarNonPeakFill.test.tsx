import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2404: The hour-of-day chart paints every NON-peak bar's inner `<rect>` with
 * `fill="#a78bfa"` (violet) so the busiest hour's amber `#fbbf24` (W1335)
 * reads as a clear single highlight against a uniform violet shaft.
 * Existing hour-chart coverage pins the peak-bar fill (W1335), the inner
 * rect's tagName (W1873), corner-radius `rx="2"` (W1284), per-bar
 * `data-count` (W715), `data-peak` (W353), the bar group's id-free
 * (W2067) / tabindex-free (W2275) contracts, the chart-level aria-label /
 * `data-peak-hour` / `data-total` markers, and the axis baseline stroke
 * (W1356) — but no test asserts the resting (non-peak) rect fill color
 * on a real hour bar. A refactor that hoists that fill into CSS, swaps to
 * a CSS variable, recolors the shaft to a different violet, or accidentally
 * applies the amber peak color to every bar would silently regress the
 * single-peak-vs-uniform-shaft visual contract. Seed one klondike play
 * yesterday in hour-bucket 10 so 10 becomes the peak; assert that a
 * different bucket (e.g. hour 9) carries `data-peak` absent AND its inner
 * rect's `fill="#a78bfa"`.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage hour-of-day — non-peak bar fill color", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2404: stats-hour-bar non-peak rect uses fill='#a78bfa' violet shaft", () => {
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

    // Hour 10 is the seeded peak. Hour 9 is a guaranteed non-peak bucket
    // — its data-peak marker is absent and its inner rect fill is violet.
    const nonPeakBar = screen.getByTestId("stats-hour-bar-9");
    expect(nonPeakBar.getAttribute("data-peak")).toBeNull();
    const rect = nonPeakBar.querySelector("rect");
    expect(rect).not.toBeNull();
    expect(rect!.getAttribute("fill")).toBe("#a78bfa");
  });
});
