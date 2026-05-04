import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1486: The achievements section's empty-state placeholder
 * (StatsPage.tsx ~L1781-L1783) renders the literal copy
 * `No achievements match.` inside `<p class="stats-empty"
 * data-testid="stats-search-empty">` whenever the search query filters
 * every achievement out. Existing tests pin the testId existence
 * (StatsPage.test.tsx L248) and the `stats-empty` class on other empty
 * states (W1305 / W1145 / W1159 — pie / personal-records / top-played),
 * but nothing pins the achievements-search empty-state COPY itself.
 *
 * The exact wording is what users actually read when their search has no
 * hits — a regression that swapped it to a generic "No results." or "No
 * matches found." would shift the user-facing voice while every existing
 * test stayed green. Pin the contract: the achievements empty state MUST
 * read the exact string `No achievements match.` (period included), so
 * future copy edits go through code review.
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

describe("StatsPage achievements search empty-state copy", () => {
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

  it("W1486: the achievements empty-state reads the exact copy 'No achievements match.' when search filters everything out", () => {
    seedStats();
    renderPage();

    // Type a query that no achievement title or description contains, so the
    // filtered list collapses to length 0 and the empty-state branch renders.
    const search = screen.getByTestId("stats-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "zzznotathing-xyzqq" } });

    const empty = screen.getByTestId("stats-search-empty") as HTMLElement;
    // Pin the user-visible copy verbatim — including the trailing period —
    // so a future copy edit (e.g. "No matches.") goes through code review.
    expect(empty.textContent).toBe("No achievements match.");
  });
});
