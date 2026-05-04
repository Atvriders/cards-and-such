import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1506: The achievements search empty-state placeholder
 * (StatsPage.tsx ~L1782) renders as
 * `<p className="stats-empty" data-testid="stats-search-empty">`.
 *
 * Existing tests pin:
 *   - testId existence (StatsPage.test.tsx L248)
 *   - exact copy "No achievements match." (W1486 / StatsAchEmptyCopy)
 *   - tagName "P" (W1498 / StatsAchSearchEmptyTag)
 *   - the `stats-empty` class on OTHER empty states (W1305 pie,
 *     W1145 personal-records, W1159 top-played)
 *
 * What is NOT pinned: the className `stats-empty` on the achievements
 * SEARCH empty-state itself. The class is the CSS hook that gives the
 * placeholder its muted/centered styling; if a refactor renamed it to
 * something like `stats-search-empty-msg` or dropped it entirely while
 * keeping the testId, the element would render unstyled and look broken
 * in production while every existing test stayed green. Pin the contract:
 * the achievements-search empty placeholder MUST carry className exactly
 * "stats-empty" so it inherits the shared empty-state styling.
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

describe("StatsPage achievements search empty-state className", () => {
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

  it("W1506: the achievements search empty-state element carries className 'stats-empty' so it picks up the shared empty-state styling", () => {
    seedStats();
    renderPage();

    // Filter every achievement out so the empty-state branch renders.
    const search = screen.getByTestId("stats-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "zzznotathing-xyzqq" } });

    const empty = screen.getByTestId("stats-search-empty") as HTMLElement;
    // Pin the exact className — not just `toContain` — because the JSX
    // ships a single class literal (`className="stats-empty"`). If a
    // refactor renames or augments it, this guard fires.
    expect(empty.className).toBe("stats-empty");
  });
});
