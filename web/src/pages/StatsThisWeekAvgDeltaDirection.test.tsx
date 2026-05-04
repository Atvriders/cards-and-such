import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1552 — stats-this-week's "Avg time" row delta direction. Existing tests
 * pin the Plays-row delta (W633 / W2333 / W2406 / W2459 — up/down/flat/em-dash)
 * and the Wins-row delta (W1252 — up). But the Avg time row's delta span,
 * driven by a *separate* pctDelta(current.avgTime, prior.avgTime) call inside
 * the same renderDelta() helper, is not pinned to any specific direction in
 * any other test.
 *
 * This test seeds plays whose times yield current avg = 120s and prior avg =
 * 60s, so pctDelta(120, 60) = round(((120 - 60) / 60) * 100) = 100, which
 * must render the Avg time row's delta span with class is-up, the ▲ glyph,
 * data-direction="up", and "100%" magnitude. A regression that wired the
 * Avg time row to plays/wins counts, dropped the avg delta entirely, or
 * inverted the direction would be caught.
 */

const STATS_KEY = "cards-and-such:stats:v1";

function seedStats(): void {
  localStorage.setItem(
    STATS_KEY,
    JSON.stringify({
      totalPlayed: 0,
      totalWins: 0,
      longestStreak: 0,
      currentStreak: 0,
      perGame: {},
      perCategory: {},
      daysPlayed: [],
      unlocked: [],
    }),
  );
}

function renderPage(): void {
  render(
    <MemoryRouter>
      <ConfirmProvider>
        <StatsPage />
      </ConfirmProvider>
    </MemoryRouter>,
  );
}

describe("StatsPage stats-this-week Avg time delta direction", () => {
  beforeEach(() => {
    localStorage.clear();
    if (typeof URL.createObjectURL !== "function") {
      Object.defineProperty(URL, "createObjectURL", {
        configurable: true,
        value: vi.fn(() => "blob:mock"),
      });
    } else {
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    }
  });

  it("W1552: Avg time row delta renders is-up with ▲ glyph and '100%' when current avg > prior avg", () => {
    seedStats();
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    // Current 7d window: two plays at 120s each → avg = 120s.
    // Prior 7d window: two plays at 60s each → avg = 60s.
    // pctDelta(120, 60) → round(100) = 100 → is-up, ▲ 100%.
    localStorage.setItem(
      "cards-time-history:klondike",
      JSON.stringify([
        { ts: now - 1 * dayMs, time: 120, score: 0 },
        { ts: now - 2 * dayMs, time: 120, score: 0 },
        { ts: now - 9 * dayMs, time: 60, score: 0 },
        { ts: now - 10 * dayMs, time: 60, score: 0 },
      ]),
    );
    renderPage();

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    // Avg time is the 3rd <li> in the current-week list (Plays / Wins / Avg time).
    const avgRow = list.querySelectorAll("li")[2];
    expect(avgRow).toBeDefined();
    expect(avgRow!.textContent).toContain("Avg time");

    const avgDelta = avgRow!.querySelector(".stats-week-delta");
    expect(avgDelta).not.toBeNull();
    expect(avgDelta!.getAttribute("data-direction")).toBe("up");
    expect(avgDelta!.classList.contains("is-up")).toBe(true);
    expect(avgDelta!.textContent).toContain("▲");
    expect(avgDelta!.textContent).toContain("100%");

    // Inversion-immunity: must not also carry down/flat styling or glyphs.
    expect(avgDelta!.classList.contains("is-down")).toBe(false);
    expect(avgDelta!.classList.contains("is-flat")).toBe(false);
    expect(avgDelta!.textContent).not.toContain("▼");
    expect(avgDelta!.textContent).not.toContain("—");
  });
});
