import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1345: The achievement-card root <div> in StatsPage.tsx ~L1770 carries the
 * literal `achievement-card` className alongside the dynamic state modifier
 * (`achievement-card unlocked` / `achievement-card in-progress` /
 * `achievement-card locked`). Existing tests pin the `data-state` attribute
 * (W515 ordering, W2078 unlocked/in-progress/locked split, etc.) and the
 * `data-testid` lookup, but no test asserts that the root carries the
 * stable `achievement-card` className token itself. A regression that:
 *   - dropped the literal `achievement-card` class (e.g. switched to
 *     `ach-card` or relied solely on a state class), or
 *   - reordered the className so the state token came first and broke the
 *     `.achievement-card.locked` CSS selector cascade,
 * would leave every existing test green because `data-testid` and
 * `data-state` would still match — but the entire `.achievement-card { ... }`
 * stylesheet block (StatsPage.css) would silently stop applying. Pin the
 * literal class on the testid'd root to lock the contract.
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

describe("StatsPage achievement card root className", () => {
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

  it("W1345: card-shark root carries literal 'achievement-card' className token alongside its state modifier", () => {
    // 25 unique perGame keys puts card-shark in the "in-progress" bucket.
    const perGame: Record<string, { played: number; wins: number; best: number }> = {};
    for (let i = 0; i < 25; i++) {
      perGame[`game-${i}`] = { played: 1, wins: 0, best: 0 };
    }
    seedStats({ totalPlayed: 25, perGame });
    renderPage();

    const card = screen.getByTestId("achievement-card-shark");
    // The literal stable class must be present — this is what every
    // `.achievement-card { ... }` rule in StatsPage.css selects against.
    expect(card.classList.contains("achievement-card")).toBe(true);
    // And the state modifier must coexist (not replace) the literal class.
    expect(card.classList.contains("in-progress")).toBe(true);
  });
});
