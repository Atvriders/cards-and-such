import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1240: The `.achievement-progress-label` element is the human-readable
 * "cur/goal" counter rendered next to the progress bar inside an achievement
 * card (StatsPage.tsx ~L1775). Existing tests cover the bar's ARIA
 * (W156 — aria-valuenow / aria-valuemin / aria-valuemax / data-pct), the
 * fill width inline style (W755), the status label (W749), and the title /
 * description text rows (W764) — but none pin the dedicated `cur/goal`
 * counter element by its class. A regression that:
 *   - rendered the counter inside the bar element instead of as a sibling,
 *   - swapped the slash format to "25 of 50" or "50/25" (goal first), or
 *   - dropped the dedicated `.achievement-progress-label` class entirely
 * would silently make the counter row unreadable / misaligned while every
 * other achievement-card assertion stayed green. Pin the element by class
 * AND its exact text to lock the contract.
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

describe("StatsPage achievement progress label", () => {
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

  it("W1240: card-shark card renders '.achievement-progress-label' as exactly '25/50' when 25 unique perGame keys are seeded", () => {
    // 25 unique perGame keys puts card-shark in the "in-progress" bucket
    // (cur=25, goal=50) — same fixture pattern used by W156/W755/W764.
    const perGame: Record<string, { played: number; wins: number; best: number }> = {};
    for (let i = 0; i < 25; i++) {
      perGame[`game-${i}`] = { played: 1, wins: 0, best: 0 };
    }
    seedStats({ totalPlayed: 25, perGame });
    renderPage();

    const card = screen.getByTestId("achievement-card-shark");
    // The counter is a dedicated sibling div with class
    // `.achievement-progress-label`, NOT nested inside the bar element.
    const label = card.querySelector(".achievement-progress-label") as HTMLElement;
    expect(label).not.toBeNull();
    // Format is "<cur>/<goal>" — current first, slash separator, goal last,
    // no spaces, no "of", no padding. Pin the exact string.
    expect(label.textContent).toBe("25/50");
  });
});
