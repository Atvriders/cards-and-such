import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1498: The achievements-search empty-state placeholder
 * (StatsPage.tsx ~L1781-L1783) is rendered as a `<p>` element:
 *
 *   <p className="stats-empty" data-testid="stats-search-empty">
 *     No achievements match.
 *   </p>
 *
 * Existing tests pin the testId existence (StatsPage.test.tsx L248) and
 * the exact copy `No achievements match.` (StatsAchEmptyCopy.test.tsx,
 * W1486), but nothing pins the *element type*. A regression that swapped
 * the `<p>` for a `<div>` or `<span>` would change the document's
 * semantic structure (paragraph vs generic block / inline phrasing) and
 * break flow-content expectations for assistive tech and CSS selectors
 * that target paragraph defaults — yet every existing test would stay
 * green.
 *
 * Pin the contract: the achievements-search empty-state element MUST be
 * a `<p>` (tagName "P"), so future refactors that change the element
 * type go through code review.
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

describe("StatsPage achievements search empty-state element type", () => {
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

  it("W1498: the achievements-search empty-state is rendered as a <p> element", () => {
    seedStats();
    renderPage();

    // Type a query that no achievement title or description contains, so the
    // filtered list collapses to length 0 and the empty-state branch renders.
    const search = screen.getByTestId("stats-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "zzznotathing-xyzqq" } });

    const empty = screen.getByTestId("stats-search-empty") as HTMLElement;
    // Pin the element type: must be a paragraph, not a div/span/etc.
    expect(empty.tagName).toBe("P");
  });
});
