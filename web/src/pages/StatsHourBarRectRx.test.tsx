import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1284: Each hour-of-day bar renders as a `<g data-testid="stats-hour-bar-{hr}">`
 * wrapping an inner `<rect rx="2">` — the subtle 2px corner-radius that
 * differentiates the hour-bar silhouette from the chunkier `rx="3"` of the
 * top-played bars (W1277). Existing hour-bar coverage pins `data-peak`
 * (W353), per-bar `data-count` (W715), the chart-level aria-label/peak-hour
 * markers, and the empty-state subtitle (W1232) — but no test asserts the
 * inner rect's corner-radius on a real hour bar. A refactor that drops the
 * `rx`, swaps to `ry`, hoists rounding into CSS, or harmonizes the value to
 * match the top-played bars (`rx="3"`) would silently regress the visual
 * contract. We seed one klondike play in the last 24h so the chart picks a
 * concrete peak hour, then scope the assertion to that peak bar's `<rect>`.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage hour-of-day — bar rect corner-radius", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1284: stats-hour-bar inner rect carries rx='2' corner-radius", () => {
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

    // The seeded play is in hour-bucket 10 — pin the inner rect's rx there.
    const barGroup = screen.getByTestId("stats-hour-bar-10");
    const rect = barGroup.querySelector("rect");
    expect(rect).not.toBeNull();
    expect(rect!.getAttribute("rx")).toBe("2");
  });
});
