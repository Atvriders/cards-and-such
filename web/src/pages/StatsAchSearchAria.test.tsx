import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1474: The achievements-section search input (StatsPage.tsx ~L1741-L1749)
 * carries `aria-label="Search achievements"` to give assistive-tech users a
 * stable accessible name independent of the visible `placeholder`. Sister
 * tests W1415 (className + type=search) and W1429 (placeholder copy) pin the
 * sighted attributes, but nothing locks the a11y label itself. A regression
 * that dropped the attribute, retitled it (e.g. "Filter achievements"), or
 * relied on placeholder-as-name (which screen readers do NOT treat as the
 * accessible name in all cases) would silently break AT users while every
 * other test stayed green. Pin the exact aria-label so any drift in the
 * achievement search input's accessible name is caught at test time.
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

describe("StatsPage achievements search input aria-label", () => {
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

  it("W1474: the achievements 'stats-search' input exposes aria-label='Search achievements'", () => {
    seedStats();
    renderPage();

    const search = screen.getByTestId("stats-search") as HTMLInputElement;
    expect(search).not.toBeNull();

    // The aria-label MUST be the exact literal — it is the sole accessible
    // name for AT users (the placeholder is NOT a reliable accessible name
    // across all screen readers / browsers).
    expect(search.getAttribute("aria-label")).toBe("Search achievements");
  });
});
