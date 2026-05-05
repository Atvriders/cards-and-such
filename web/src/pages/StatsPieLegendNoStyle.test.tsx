import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2186 — Sibling to W2078 (legend has no id) and W1259 (legend className).
 * The `<ul className="stats-pie-legend">` rendered by PieChart should stay
 * style-free: all legend layout (flex direction, gap, swatch alignment) lives
 * in the `.stats-pie-legend` CSS rule, never in an inline `style` attribute.
 * The only inline style inside the legend lives on the per-row `.swatch`
 * `<span>` (which carries the row's slice color). A future refactor that
 * lifts a hard-coded `display: flex` or color onto the `<ul>` itself would
 * silently override the stylesheet and break theme overrides. No existing
 * Stats* test pins the legend's lack of a `style` attribute, so this test
 * guards that contract alongside the broader Stats*NoStyle family
 * (StatsHourBarNoStyle, StatsHeatmapNoStyle, StatsLineChartNoStyle, etc.).
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

describe("StatsPage pie chart legend has no style attribute", () => {
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

  it("W2186: <ul.stats-pie-legend> renders without a style attribute", () => {
    seedRichStats();
    renderPage();
    const chart = screen.getByTestId("stats-pie-chart");
    const wrap = chart.parentElement;
    expect(wrap).not.toBeNull();
    const legend = wrap!.querySelector("ul.stats-pie-legend");
    expect(legend).not.toBeNull();
    expect(legend!.tagName.toLowerCase()).toBe("ul");
    expect(legend!.hasAttribute("style")).toBe(false);
  });
});
