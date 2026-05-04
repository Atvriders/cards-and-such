import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1356: The hour-of-day chart draws a single horizontal axis baseline
 * (`<line>` from `pad,h-pad` to `w-pad,h-pad`) immediately before the 24
 * `<g data-testid="stats-hour-bar-*">` bar groups, painted with a faint
 * slate `stroke="rgba(148,163,184,0.25)"` so the bars read as resting on
 * a soft rule rather than floating in the SVG viewport. Existing hour-
 * chart coverage pins the bar `<rect>` corner-radius `rx="2"` (W1284),
 * tick label `text-anchor="middle"` (W1289), peak-bar `fill="#fbbf24"`
 * (W1335), per-bar `data-count` (W715), `data-peak` (W353), and the
 * chart-level `aria-label` / `data-peak-hour` / `data-total` markers —
 * but no test asserts the baseline rule's stroke color. A refactor that
 * drops the line, swaps the rgba for a hex token, hoists the rule into
 * CSS, or recolors it to match the heavier `#a78bfa` bar shaft would
 * silently regress the chart's quiet axis-vs-bar hierarchy. Seed one
 * klondike play yesterday so the chart populates with a real peak,
 * then scope the assertion to the first `<line>` child of the
 * `stats-hour-chart` SVG (the only baseline rule rendered there).
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage hour-of-day — axis baseline stroke", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1356: stats-hour-chart baseline line carries faint slate stroke", () => {
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

    // The hour chart renders exactly one <line> — the axis baseline rule.
    const chart = screen.getByTestId("stats-hour-chart");
    const baseline = chart.querySelector("line");
    expect(baseline).not.toBeNull();
    expect(baseline!.getAttribute("stroke")).toBe("rgba(148,163,184,0.25)");
  });
});
