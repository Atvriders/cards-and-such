import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1429: The achievements-section search input (StatsPage.tsx ~L1741-L1749)
 * exposes a sighted hint via `placeholder="Search achievements…"`. Sister
 * test W1415 pins the input's `className="stats-search"` and `type="search"`
 * on the same element, but nothing pins the placeholder copy itself. The
 * placeholder is the only sighted affordance telling users the empty input
 * filters achievements (the visually-hidden `aria-label` covers AT users),
 * so a copy-edit that retitled it (e.g. to "Filter…" or "Find badge…"),
 * dropped the literal ellipsis character, or removed the attribute entirely
 * would silently degrade the empty-state UX. Pin the exact placeholder
 * string on the achievements search input so any drift in the visible hint
 * is caught at test time.
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

describe("StatsPage achievements search input placeholder", () => {
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

  it("W1429: the achievements 'stats-search' input exposes placeholder='Search achievements…'", () => {
    seedStats();
    renderPage();

    const search = screen.getByTestId("stats-search") as HTMLInputElement;
    expect(search).not.toBeNull();

    // The placeholder MUST be the exact literal — including the trailing
    // ellipsis character (…, U+2026, NOT three dots) — so that the only
    // sighted hint about what the empty input filters never silently drifts.
    expect(search.getAttribute("placeholder")).toBe("Search achievements…");
  });
});
