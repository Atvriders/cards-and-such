import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2078 — Sibling to W1259 (legend className) and the broader Stats*NoId
 * family. The `<ul className="stats-pie-legend">` rendered by PieChart should
 * stay anonymous: it has no `id` attribute, intentionally relying on its
 * className for selection (CSS + W1259) instead of a global identifier. If
 * a future refactor adds an `id` (e.g. `id="stats-pie-legend"` for
 * aria-controls or anchor linking), it could clash with multiple PieChart
 * instances on a single page (currently only one, but the component is
 * generic) and would silently violate the "no DOM ids on chart innards"
 * convention shared by StatsHeatmap*, StatsHourBar*, StatsLineChart*,
 * StatsPersonalRecordsNoId, and StatsCardGridNoId. No existing Stats* test
 * pins the legend's lack of an `id`, so this test guards that contract.
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

describe("StatsPage pie chart legend has no id attribute", () => {
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

  it("W2078: <ul.stats-pie-legend> renders without an id attribute", () => {
    seedRichStats();
    renderPage();
    const chart = screen.getByTestId("stats-pie-chart");
    const wrap = chart.parentElement;
    expect(wrap).not.toBeNull();
    const legend = wrap!.querySelector("ul.stats-pie-legend");
    expect(legend).not.toBeNull();
    expect(legend!.tagName.toLowerCase()).toBe("ul");
    expect(legend!.hasAttribute("id")).toBe(false);
  });
});
