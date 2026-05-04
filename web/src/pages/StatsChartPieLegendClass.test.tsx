import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1259 — Sibling to W1238 (pie SVG role+aria-label). The PieChart wraps its
 * legend in `<ul className="stats-pie-legend">` so CSS can style swatch rows
 * next to the chart. W1238 pins the SVG's accessibility shape, but no test
 * currently pins the *legend list* className — a refactor that renames the
 * class (e.g. to `pie-legend` or `stats-legend`), drops the `<ul>` wrapper
 * in favour of inline `<span>`s, or moves the legend outside `.stats-pie-wrap`
 * would break the `.stats-pie-legend` CSS selector and silently de-style the
 * legend rows without any other Stats* test catching it.
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

describe("StatsPage pie chart legend className", () => {
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

  it("W1259: pie chart legend is a <ul> with className 'stats-pie-legend' as a sibling of stats-pie-chart", () => {
    seedRichStats();
    renderPage();
    const chart = screen.getByTestId("stats-pie-chart");
    const wrap = chart.parentElement;
    expect(wrap).not.toBeNull();
    const legend = wrap!.querySelector(".stats-pie-legend");
    expect(legend).not.toBeNull();
    expect(legend!.tagName.toLowerCase()).toBe("ul");
    expect(legend!.className).toContain("stats-pie-legend");
    // Legend should contain at least one row for the seeded games.
    expect(legend!.querySelectorAll("li").length).toBeGreaterThan(0);
  });
});
