import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1415: The achievements-section search input (StatsPage.tsx ~L1741-L1749)
 * carries `className="stats-search"`. Existing tests pin the input's
 * `data-testid="stats-search"` and the empty-state `data-testid="stats-search-empty"`,
 * but nothing pins the className itself. The class is what the section's
 * stylesheet hooks onto for layout/spacing/border, so a regression that
 * dropped or renamed the class (e.g. to `stats-input` or `ach-search`) would
 * leave every test green while the input visibly drifts. Pin the contract:
 * the achievements search input MUST be an `<input type="search">` and MUST
 * carry the literal `stats-search` class — together, on the same element.
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

describe("StatsPage achievements search input class", () => {
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

  it("W1415: the achievements 'stats-search' input carries class 'stats-search' AND is type=search", () => {
    seedStats();
    renderPage();

    const search = screen.getByTestId("stats-search") as HTMLInputElement;
    expect(search).not.toBeNull();

    // The input MUST be an <input>, MUST be type=search (so browsers render
    // the clear-X affordance and announce it as a search field), AND MUST
    // carry the 'stats-search' class that the achievements-card stylesheet
    // hooks onto for layout/spacing.
    expect(search.tagName).toBe("INPUT");
    expect(search.type).toBe("search");
    expect(search.classList.contains("stats-search")).toBe(true);
  });
});
