import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1326: The `.achievement-status` element inside an achievement card
 * (StatsPage.tsx ~L1777) is rendered as a plain `<div>` — it sits beneath
 * the progress block as a flat status row, NOT a heading or list-item. The
 * existing W749 test pins the textContent across all three buckets
 * (Unlocked / In progress / Locked), and W764 covers the title / desc text.
 * But no existing test pins the *tagName* of the status element. A
 * regression that swapped it to a `<span>` would collapse the row to
 * inline-flow and break the card layout, while a swap to `<h3>` / `<li>`
 * would inject unintended document-outline / list semantics — yet every
 * existing text-based assertion would stay green. Pin the tagName to lock
 * the structural contract.
 */

const STATS_KEY = "cards-and-such:stats:v1";

interface PerGameStats {
  played: number;
  wins: number;
  best: number;
}

interface StatsFixture {
  totalPlayed?: number;
  totalWins?: number;
  longestStreak?: number;
  currentStreak?: number;
  perGame?: Record<string, PerGameStats>;
  perCategory?: Record<string, number>;
  daysPlayed?: string[];
  unlocked?: string[];
}

function seedStats(fix: StatsFixture = {}): void {
  const state = {
    totalPlayed: fix.totalPlayed ?? 0,
    totalWins: fix.totalWins ?? 0,
    longestStreak: fix.longestStreak ?? 0,
    currentStreak: fix.currentStreak ?? 0,
    perGame: fix.perGame ?? {},
    perCategory: fix.perCategory ?? {},
    daysPlayed: fix.daysPlayed ?? [],
    unlocked: fix.unlocked ?? [],
  };
  localStorage.setItem(STATS_KEY, JSON.stringify(state));
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

describe("StatsPage achievement status tagName", () => {
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

  it("W1326: achievement card's '.achievement-status' element is rendered as a <div>, not a span/heading/list-item", () => {
    // Same fixture pattern used by W749: seed an unlocked + in-progress +
    // locked card so we can sample the tagName on a real "in-progress" card
    // (the most common bucket users see).
    const perGame: Record<string, { played: number; wins: number; best: number }> = {};
    for (let i = 0; i < 25; i++) {
      perGame[`game-${i}`] = { played: 1, wins: 0, best: 0 };
    }
    seedStats({ totalPlayed: 25, perGame });
    renderPage();

    const card = screen.getByTestId("achievement-card-shark");
    const status = card.querySelector(".achievement-status") as HTMLElement;
    expect(status).not.toBeNull();
    // Pin the tagName: must be a plain DIV. Any future swap to span / h3 /
    // li would change the box-flow or document outline and should require
    // an intentional update to this assertion.
    expect(status.tagName).toBe("DIV");
  });
});
