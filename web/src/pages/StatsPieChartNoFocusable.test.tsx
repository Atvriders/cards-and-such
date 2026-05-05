import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2390 — The PieChart component renders an `<svg data-testid="stats-pie-chart">`
 * with className `"stats-svg stats-pie"`, a `role="img"`, an `aria-label`, and a
 * `viewBox`, but it intentionally has no `focusable` attribute. Existing pie
 * tests pin the container tagName (W1238), the role+aria-label (W1238), the
 * absence of `id` (W2077), the absence of `style` (W2141), and the absence of
 * `tabindex` (W2278), but no Stats* test pins the *absence* of `focusable` on
 * the live in-DOM chart SVG. (The export-payload pie SVG has its own focusable
 * test in StatsExportPieSvgFocusable.test.tsx but that targets the offscreen
 * export string, not the rendered chart node.)
 *
 * The `focusable` attribute is an SVG-specific legacy IE/Edge quirk: when set
 * to `"true"` it makes the SVG element a focus stop in some legacy browsers
 * regardless of `tabindex`. Adding `focusable="true"` (or even `"false"` as a
 * defensive over-spec) would either inject an unexpected focus stop or mask
 * the simple "no extra attributes" contract the chart relies on. This pins
 * `chart.hasAttribute("focusable") === false` so any future addition surfaces
 * here.
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

describe("StatsPage pie chart svg has no focusable attribute", () => {
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

  it("W2390: stats-pie-chart svg has no `focusable` attribute", () => {
    seedRichStats();
    renderPage();
    const chart = screen.getByTestId("stats-pie-chart");
    expect(chart.hasAttribute("focusable")).toBe(false);
  });
});
