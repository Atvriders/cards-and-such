import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2278 — The PieChart component renders an `<svg data-testid="stats-pie-chart">`
 * with className `"stats-svg stats-pie"`, a `role="img"`, an `aria-label`, and a
 * `viewBox`, but it intentionally has no `tabindex` attribute. Existing pie
 * tests pin the wrapper className (W1900/W1913), the legend className (W1259),
 * the container tagName (W1238), the aria-label (W*Aria), the absence of `id`
 * (W2077), and the absence of `style` (W*NoStyle), but no Stats* test pins the
 * *absence* of `tabindex` on the chart SVG itself. The chart is a presentational
 * `role="img"` and is not meant to be in the keyboard tab order — adding
 * `tabindex="0"` (or any value) would inject an unexpected focus stop into the
 * Stats page tab cycle, hurting keyboard navigation. This pins
 * `chart.hasAttribute("tabindex") === false` so any future addition surfaces here.
 */

const STATS_KEY = "cards-and-such:stats:v1";

function seedRichStats(): void {
  const state = {
    totalPlayed: 25,
    totalWins: 10,
    longestStreak: 4,
    currentStreak: 2,
    perGame: {
      "klondike": { played: 12, wins: 5, best: 300 },
      "spider": { played: 8, wins: 3, best: 200 },
      "agram": { played: 3, wins: 1, best: 50 },
      "balut": { played: 2, wins: 1, best: 75 },
    },
    perCategory: { solitaire: 20, cards: 3, dice: 2 },
    daysPlayed: ["2026-04-30", "2026-05-01", "2026-05-02"],
    unlocked: ["first-win", "ten-wins"],
  };
  localStorage.setItem(STATS_KEY, JSON.stringify(state));
  localStorage.setItem("cards-hints-used", JSON.stringify({ klondike: 7, spider: 3 }));
  localStorage.setItem("cards-undos-used", JSON.stringify({ klondike: 5, spider: 2 }));
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

describe("StatsPage pie chart svg has no tabindex attribute", () => {
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
    if (typeof URL.revokeObjectURL !== "function") {
      Object.defineProperty(URL, "revokeObjectURL", {
        configurable: true,
        value: vi.fn(),
      });
    } else {
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    }
  });

  it("W2278: stats-pie-chart svg has no `tabindex` attribute", () => {
    seedRichStats();
    renderPage();
    const chart = screen.getByTestId("stats-pie-chart");
    expect(chart.hasAttribute("tabindex")).toBe(false);
  });
});
