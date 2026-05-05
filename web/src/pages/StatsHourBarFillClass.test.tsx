import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1873: Each hour-of-day bar renders as a `<g data-testid="stats-hour-bar-{hr}">`
 * wrapping its inner fill shape — an SVG `<rect>` carrying width/height/fill —
 * before any optional axis-tick `<text>` label. Sibling hour-bar tests pin
 * the rect's corner-radius `rx="2"` (W1284), the peak-bar amber `fill`
 * (W1335), the per-bar `data-count` (W715), `data-peak` (W353), the chart-
 * level `aria-label` / `data-peak-hour` / `data-total` markers, the axis
 * baseline stroke (W1356), and the empty-state subtitle <p> tagName
 * (W1821) — but none asserts the inner fill element's actual *tagName*.
 * A refactor that swapped the rect for a `<path>`, hoisted it into a
 * `<polygon>`, replaced it with a `<use>` reference, or wrapped it in
 * a foreignObject would silently regress the chart's SVG-shape contract
 * even while keeping the surrounding attributes (rx/fill) on whatever
 * shape replaced it. Note: SVGElement.tagName is preserved as lowercase
 * in both jsdom and real browsers — distinct from HTMLElement's uppercase
 * casing — so we compare `.tagName` directly to `"rect"`. Seed one
 * klondike play yesterday in hour-bucket 10 so the chart populates with
 * a real bar, then scope the assertion to that bar's `firstElementChild`
 * (the fill rect, which always precedes any sibling label `<text>`).
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage hour-of-day — bar inner fill element tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1873: stats-hour-bar inner fill element is an SVG <rect>", () => {
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

    // Hour 10 is the seeded peak bucket; its first child is the fill rect.
    const barGroup = screen.getByTestId("stats-hour-bar-10");
    const fill = barGroup.firstElementChild;
    expect(fill).not.toBeNull();
    // SVG element tagName is preserved as lowercase in jsdom and browsers.
    expect(fill!.tagName).toBe("rect");
  });
});
