import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2077 — The PieChart component renders an `<svg data-testid="stats-pie-chart">`
 * with className `"stats-svg stats-pie"`, a `role="img"`, an `aria-label`, and a
 * `viewBox`, but it intentionally has no `id` attribute. Existing pie tests pin
 * the wrapper className (W1900/W1913), the legend className (W1259), the
 * container tagName (W1238), and the aria-label (W*Aria), but no Stats* test
 * pins the *absence* of `id` on the chart SVG itself. A refactor that adds
 * `id="stats-pie-chart"` (or any other id) would silently introduce a global
 * DOM identifier — risking duplicate-id collisions if PieChart is ever reused —
 * without any test catching it. This pins `chart.hasAttribute("id") === false`
 * so any future addition surfaces here.
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

describe("StatsPage pie chart svg has no id attribute", () => {
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

  it("W2077: stats-pie-chart svg has no `id` attribute", () => {
    seedRichStats();
    renderPage();
    const chart = screen.getByTestId("stats-pie-chart");
    expect(chart.hasAttribute("id")).toBe(false);
  });
});
