import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1859: The Replays panel empty-state placeholder
 * (StatsPage.tsx ~L1700) renders as
 *   <p className="stats-empty" data-testid="stats-replays-empty">
 *     No replays saved yet — finish a game and tap "Save replay" on the win banner.
 *   </p>
 * when no replays have been saved (`cards-replays` is missing or holds an
 * empty array).
 *
 * Existing coverage pins:
 *   - testId existence + copy text (W745, StatsPage.test.tsx L2031)
 *   - parent panel `stats-replays-panel` structure
 *   - the `stats-empty` className on OTHER empty-state branches:
 *       * pie / records (W1305, StatsEmptyPieTag)
 *       * achievements search (W1506, StatsAchSearchEmptyClass)
 *       * personal-records / categories (W1145, W1159 — but only via
 *         `toContain`, not exact `toBe`)
 *
 * What is NOT pinned: the EXACT className on the replays empty-state
 * element. The class is the single CSS hook the `.stats-empty` rule was
 * authored against — muted color, centered axis, padded margin. If a
 * refactor renamed it (e.g. to `stats-replays-empty-msg`) or appended
 * extra utility classes, the testId-based test would still pass while the
 * placeholder would render unstyled in production. Pin the contract: the
 * replays empty-state element MUST carry className exactly "stats-empty"
 * (single literal, no extras) so it inherits the shared empty-state
 * styling.
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

describe("StatsPage replays empty-state className", () => {
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

  it("W1859: the replays empty-state element carries className exactly 'stats-empty' when no replays are saved", () => {
    // No history fixture: leave `cards-replays` unset so `loadReplays()`
    // resolves to [] and the `replays.length === 0` branch fires. Stats
    // localStorage stays empty too — irrelevant to this branch but keeps
    // the page from coupling to other panels' state.
    renderPage();

    const panel = screen.getByTestId("stats-replays-panel");
    const empty = within(panel).getByTestId("stats-replays-empty") as HTMLElement;
    // Exact-match pin (not `toContain`) — the JSX ships a single class
    // literal (`className="stats-empty"`). Any refactor that renames or
    // augments the class string trips this guard.
    expect(empty.className).toBe("stats-empty");
  });
});
