import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2458: The hour-of-day chart prints x-axis tick labels every six hours
 * (0, 6, 12, 18, plus 23 as the right-edge bookend). Each tick is a `<text>`
 * node painted at `fill="rgba(203,213,225,0.7)"` so the digits sit as a
 * muted slate against the dark card without competing with the bar shafts
 * (which are the saturated `#a78bfa`/`#fbbf24` accents). Drop the attribute
 * and SVG falls back to `fill="black"`, which reads as a hard line of inked
 * digits under the bars; bump the alpha to `1` and the labels go louder
 * than the chart subtitle; hoist the colour into CSS and it won't apply to
 * SVG `<text>` the same way the presentation attribute does. Existing
 * hour-chart coverage pins the bar `<rect>` corner-radius `rx="2"` (W1284),
 * the per-bar `data-count` (W715) and `data-peak` (W353), peak-bar
 * `fill="#fbbf24"` (W1335), non-peak rect `fill="#a78bfa"` (W2404), the
 * baseline `<line>` stroke (W1356), the SVG container's `class="stats-svg"`
 * (W1891), `role="img"` (W2369), the tick label's `text-anchor="middle"`
 * (W1289), and the tick label's `font-size="9"` (W2451) — but no test
 * asserts the tick label's `fill`. We seed one klondike play yesterday so
 * the chart populates, then scope to the `0` tick label and pin its colour.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage hour-of-day — tick label fill", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2458: hour-of-day '0' tick label uses fill='rgba(203,213,225,0.7)'", () => {
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
    expect(zeroLabel!.getAttribute("fill")).toBe("rgba(203,213,225,0.7)");
  });
});
