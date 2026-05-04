import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1372: The progress bar element inside each achievement card carries the
 * dedicated `.achievement-progress-bar` className (StatsPage.tsx ~L1774).
 * Existing tests pin the bar's ARIA contract (W156 — aria-valuenow / -valuemin
 * / -valuemax / data-pct), the inner `.achievement-progress-fill` width style
 * (W755), the sibling `.achievement-progress-label` "cur/goal" text (W1240),
 * the parent card root class (W1345), and the achievement status div tag
 * (W1326) — but none assert the bar element is reachable via the bar's own
 * className. A regression that renamed the class (e.g. to `.progress-bar`),
 * dropped the className while keeping `role="progressbar"`, or split the bar
 * into a different DOM shape would silently break CSS targeting (fill geometry,
 * track styling, theme overrides) while every ARIA / fill-style / label
 * assertion stayed green. Pin the className directly.
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

describe("StatsPage achievement progress bar class", () => {
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

  it("W1372: card-shark progress bar element exposes className '.achievement-progress-bar' on the role=progressbar node", () => {
    // Same 25-perGame-keys fixture as W156/W755/W1240 so card-shark sits in
    // the in-progress bucket and renders a real progress bar (not the locked
    // 0/50 placeholder).
    const perGame: Record<string, { played: number; wins: number; best: number }> = {};
    for (let i = 0; i < 25; i++) {
      perGame[`game-${i}`] = { played: 1, wins: 0, best: 0 };
    }
    seedStats({ totalPlayed: 25, perGame });
    renderPage();

    const card = screen.getByTestId("achievement-card-shark");
    // Look up the bar by its className first — that is the contract under
    // test. It must resolve to the same node as the role="progressbar"
    // element (one bar per card, exactly).
    const barByClass = card.querySelector(".achievement-progress-bar") as HTMLElement | null;
    expect(barByClass).not.toBeNull();
    const barByRole = card.querySelector('[role="progressbar"]') as HTMLElement | null;
    expect(barByRole).not.toBeNull();
    expect(barByClass).toBe(barByRole);
    // Pin the exact className string — guards against accidental extra
    // class tokens or whitespace drift sneaking in alongside the bar class.
    expect(barByClass!.className).toBe("achievement-progress-bar");
  });
});
