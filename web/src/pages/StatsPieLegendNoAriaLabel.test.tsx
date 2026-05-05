import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2394 — Sibling to W2078 (legend has no id), W2186 (no style), W2279 (no
 * tabindex). The `<ul className="stats-pie-legend">` rendered by PieChart is
 * a static, decorative legend whose accessible name is implicit from its
 * adjacent `<svg data-testid="stats-pie-chart">` and the visible label/value
 * pairs in each `<li>`. The `<ul>` itself must not declare an explicit
 * `aria-label` attribute: doing so would override the natural semantics with
 * an out-of-band string that drifts from the on-screen labels and adds noise
 * for screen-reader users. No existing Stats* test pins the legend's lack of
 * `aria-label`, so this test guards that contract.
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

describe("StatsPage pie chart legend has no aria-label attribute", () => {
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

  it("W2394: <ul.stats-pie-legend> renders without an aria-label attribute", () => {
    seedRichStats();
    renderPage();
    const chart = screen.getByTestId("stats-pie-chart");
    const wrap = chart.parentElement;
    expect(wrap).not.toBeNull();
    const legend = wrap!.querySelector("ul.stats-pie-legend");
    expect(legend).not.toBeNull();
    expect(legend!.tagName.toLowerCase()).toBe("ul");
    expect(legend!.hasAttribute("aria-label")).toBe(false);
  });
});
