/**
 * Unit test for PlayPage `recordGame` call on terminal-win (W641).
 *
 * Invariant under test: when the reducer transitions the game into a
 * terminal-win state (`isTerminal` returns `{ score > 0 }`), PlayPage
 * MUST forward the result to `recordGame()` such that the persisted
 * stats blob at `cards-and-such:stats:v1` has BOTH `totalPlayed` and
 * `totalWins` bumped by at least one relative to their pre-click values.
 *
 * Strategy mirrors PlayPage.timeHistoryWin.test.tsx:
 *   - `vi.hoisted` defines a fixture plugin whose reducer counts moves
 *     and whose `isTerminal` returns `{ score: 50 }` once `moves >= 1`,
 *     so a single click drives PlayPage into the terminal-win branch
 *     that calls `recordGame` (one step from the fixture button).
 *   - We assert directly against the storage blob rather than spying on
 *     `recordGame`, so we exercise the real persistence path end-to-end.
 *   - Storage is cleared in `beforeEach` so the post-win blob starts at
 *     a known baseline (totalPlayed = 0, totalWins = 0).
 *   - The page mounts with `?quickstart=1` to skip the setup screen and
 *     land directly in the playing phase.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; isTerminal returns a
// positive-score payload as soon as `moves >= 1`, so a single dispatch
// from the fixture button reaches the terminal-win branch in PlayPage
// that calls `recordGame(plugin.id, score, won, time)`.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "record-game-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Record Game Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for terminal-win recordGame persistence.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 50 } : null,
    component: ({ dispatch }: { dispatch: (a: Action) => void }) => (
      <div>
        <button
          data-testid="fx-win"
          type="button"
          onClick={() => dispatch({ type: "win-now" })}
        >
          win
        </button>
      </div>
    ),
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// terminal-win render side-effect-free.
vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

const STATS_KEY = "cards-and-such:stats:v1";

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage recordGame on terminal-win (W641)", () => {
  it("bumps totalPlayed and totalWins in cards-and-such:stats:v1 on win", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    // Baseline: nothing persisted yet, so a fresh blob is implicit.
    expect(localStorage.getItem(STATS_KEY)).toBeNull();

    // `?quickstart=1` skips the setup screen and drops us into the
    // playing phase, so the fixture button mounts without ceremony.
    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const winBtn = screen.getByTestId("fx-win");
    fireEvent.click(winBtn);

    // The terminal-win branch in PlayPage.dispatch calls
    // `recordGame(plugin.id, term.score, term.score > 0, elapsed)`,
    // which persists the stats blob under `cards-and-such:stats:v1`.
    const raw = localStorage.getItem(STATS_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string) as {
      totalPlayed: number;
      totalWins: number;
    };

    // Both counters must be bumped — `recordGame` increments
    // `totalPlayed` unconditionally and `totalWins` when `won` is true.
    // Use `>= 1` to stay robust against the React 18 dev-mode setState
    // updater double-invocation under jsdom.
    expect(typeof parsed.totalPlayed).toBe("number");
    expect(typeof parsed.totalWins).toBe("number");
    expect(parsed.totalPlayed).toBeGreaterThanOrEqual(1);
    expect(parsed.totalWins).toBeGreaterThanOrEqual(1);
  });
});

// Reference React so this file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
