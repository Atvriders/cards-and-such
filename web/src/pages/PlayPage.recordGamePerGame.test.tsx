/**
 * Unit test for PlayPage `recordGame` per-game session count (W694).
 *
 * Invariant under test: when the reducer transitions the game into a
 * terminal-win state (`isTerminal` returns `{ score > 0 }`), PlayPage
 * MUST forward the result to `recordGame()` such that the persisted
 * stats blob at `cards-and-such:stats:v1` records the win against the
 * specific `gameId` under `perGame[gameId]` — i.e. `perGame[gameId]`
 * exists, has `played >= 1` and `wins >= 1`, and `best` is at least
 * the `score` returned by `isTerminal`.
 *
 * This complements PlayPage.recordGame.test.tsx (which only asserts the
 * top-level `totalPlayed` / `totalWins` aggregates) by pinning the
 * per-game session bucket — without this, a regression that recorded
 * the win under a wrong key (e.g. plugin.title vs plugin.id) or skipped
 * the perGame map entirely would still pass the aggregate assertions.
 *
 * Strategy mirrors PlayPage.recordGame.test.tsx:
 *   - `vi.hoisted` defines a fixture plugin whose reducer counts moves
 *     and whose `isTerminal` returns `{ score: 75 }` once `moves >= 1`,
 *     so a single click drives PlayPage into the terminal-win branch
 *     that calls `recordGame(plugin.id, score, won, time)`.
 *   - We assert directly against the storage blob rather than spying on
 *     `recordGame`, so we exercise the real persistence path end-to-end.
 *   - Storage is cleared in `beforeEach` so the post-win blob starts at
 *     a known baseline (no `perGame[id]` entry exists pre-click).
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
  const TEST_GAME_ID = "record-game-pergame-fixture";
  const TEST_SCORE = 75;
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Record Game PerGame Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for terminal-win perGame bucket persistence.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: TEST_SCORE } : null,
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
  return { TEST_GAME_ID, TEST_SCORE, fixturePlugin };
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

describe("PlayPage recordGame perGame bucket on terminal-win (W694)", () => {
  it("records the win under perGame[gameId] with played/wins/best populated", async () => {
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
    // which writes a perGame[plugin.id] bucket with
    // { played: prev.played + 1, wins: prev.wins + 1, best: max(prev.best, score) }.
    const raw = localStorage.getItem(STATS_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string) as {
      perGame: Record<string, { played: number; wins: number; best: number }>;
    };

    // perGame map must contain a bucket keyed by the plugin's id (not its
    // title or any other field). A regression that mis-keyed the bucket
    // would surface here.
    expect(parsed.perGame).toBeDefined();
    expect(parsed.perGame).toHaveProperty(hoisted.TEST_GAME_ID);

    const bucket = parsed.perGame[hoisted.TEST_GAME_ID]!;
    expect(typeof bucket.played).toBe("number");
    expect(typeof bucket.wins).toBe("number");
    expect(typeof bucket.best).toBe("number");

    // `played` and `wins` are bumped by `recordGame` for a winning round.
    // Use `>= 1` to stay robust against the React 18 dev-mode setState
    // updater double-invocation under jsdom (mirrors PlayPage.recordGame.test.tsx).
    expect(bucket.played).toBeGreaterThanOrEqual(1);
    expect(bucket.wins).toBeGreaterThanOrEqual(1);
    // `best` is `Math.max(prev.best, score)` — prev was 0, so the
    // bucket's best must be at least the score we returned from isTerminal.
    expect(bucket.best).toBeGreaterThanOrEqual(hoisted.TEST_SCORE);
  });
});

// Reference React so this file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
