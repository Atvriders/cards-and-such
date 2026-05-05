import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2079 — Sibling to W1913 (pie-wrap exact className) and W1900 (pie-wrap
 * tagName DIV). The PieChart component renders its `<svg data-testid=
 * "stats-pie-chart">` inside a `<div className="stats-pie-wrap">` container
 * with no `id` attribute. No existing Stats* test pins the *absence* of an
 * `id` on this wrapper. A refactor that adds an `id` (e.g. for an in-page
 * anchor like `id="pie-wrap"`, scrollIntoView target, or a label-by/aria
 * relationship) would silently introduce a global ID that conflicts with
 * any other StatsPage instance on the same document or breaks the existing
 * className-only DOM contract for snapshot/E2E consumers. This pins the
 * `hasAttribute("id") === false` invariant so any addition surfaces here.
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

describe("StatsPage pie chart container has no id attribute", () => {
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

  it("W2079: stats-pie-wrap container has no id attribute", () => {
    seedRichStats();
    renderPage();
    const chart = screen.getByTestId("stats-pie-chart");
    const wrap = chart.parentElement;
    expect(wrap).not.toBeNull();
    expect(wrap!.className).toContain("stats-pie-wrap");
    expect(wrap!.hasAttribute("id")).toBe(false);
  });
});
