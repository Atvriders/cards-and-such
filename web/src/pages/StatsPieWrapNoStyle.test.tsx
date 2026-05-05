import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2185 — Sibling to W1913 (pie-wrap exact className), W1900 (pie-wrap tagName
 * DIV), and W2079 (pie-wrap no `id`). The PieChart component renders its
 * `<svg data-testid="stats-pie-chart">` inside a `<div className="stats-pie-
 * wrap">` container with no inline `style` attribute — all sizing/spacing is
 * handled by the `.stats-pie-wrap` CSS rules in `StatsPage.css`. No existing
 * Stats* test pins the *absence* of a `style` attribute on this wrapper. A
 * refactor that adds inline styles (e.g. `style={{ display: "flex" }}`,
 * `style={{ minHeight: 200 }}`, or a CSS custom property like
 * `style={{ "--pie-size": "160px" }}`) would silently override the stylesheet,
 * couple component code to layout values, and bypass theme tokens. This test
 * pins `hasAttribute("style") === false` so any inline-style addition surfaces
 * here and forces an explicit decision about CSS vs inline styling.
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

describe("StatsPage pie chart container has no inline style attribute", () => {
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

  it("W2185: stats-pie-wrap container has no style attribute", () => {
    seedRichStats();
    renderPage();
    const chart = screen.getByTestId("stats-pie-chart");
    const wrap = chart.parentElement;
    expect(wrap).not.toBeNull();
    expect(wrap!.className).toContain("stats-pie-wrap");
    expect(wrap!.hasAttribute("style")).toBe(false);
  });
});
