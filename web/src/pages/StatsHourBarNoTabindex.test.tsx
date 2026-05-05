import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2275: Each hour-of-day bar `<g data-testid="stats-hour-bar-{hr}">` is a
 * decorative SVG group that should NOT participate in the keyboard tab
 * order — it carries NO `tabindex` attribute. Sibling hour-bar tests pin
 * the bar's id-free contract (W2067), the inner rect's tagName / `rx="2"`
 * corner radius, peak-bar amber fill, per-bar `data-count` / `data-peak`
 * markers, the chart-level `aria-label` / `data-peak-hour` / `data-total`
 * attributes, and the axis baseline stroke — but none asserts the absence
 * of a `tabindex` on the bar group itself. Adding `tabindex="0"` (e.g.
 * to make the bars keyboard-focusable) on a 24-bar repeated SVG group
 * would inject 24 extra tab stops per chart, drown out actually
 * interactive controls (reset, export, drilldown), and conflict with the
 * non-interactive `role="img"` semantics applied to the parent svg; this
 * test pins the current tabindex-free contract so a future refactor
 * can't silently introduce that regression. Seed one klondike play
 * yesterday in hour-bucket 10 so the chart populates and assert that
 * bar's `hasAttribute("tabindex") === false`.
 */
const STATS_KEY = "cards-and-such:stats:v1";

describe("StatsPage hour-of-day — bar group has no tabindex attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2275: stats-hour-bar <g> carries no `tabindex` attribute", () => {
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
    expect(barGroup.hasAttribute("tabindex")).toBe(false);
  });
});
