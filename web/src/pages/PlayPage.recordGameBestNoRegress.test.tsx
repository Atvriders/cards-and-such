/**
 * Unit test for PlayPage `recordGame` best-score no-regression (W700).
 *
 * Invariant under test: when the reducer transitions the game into a
 * terminal-win state with a WORSE score than what is already persisted
 * under `perGame[gameId].best`, PlayPage MUST forward to `recordGame()`
 * such that the existing best is PRESERVED — never clobbered by the
 * lower-scoring win.
 *
 * The contract lives in `web/src/platform/stats.ts`:
 *
 *     s.perGame[gameId] = {
 *       played: prev.played + 1,
 *       wins:   prev.wins + (won ? 1 : 0),
 *       best:   Math.max(prev.best, score),
 *     };
 *
 * `Math.max(prev, score)` is the no-regression guard: higher score = better
 * (matches stats.ts achievements like `wordle-whiz` and `pig-out` that key
 * off `best >= N`). Without this assertion, a regression that swapped
 * `Math.max` for `Math.min`, plain assignment, or a bad branch (e.g.
 * `score < prev.best ? score : prev.best`) would still pass the existing
 * W641 / W694 tests because those only check `best >= score` on a fresh blob.
 *
 * Strategy mirrors PlayPage.recordGamePerGame.test.tsx:
 *   - `vi.hoisted` defines a fixture plugin whose `isTerminal` returns a
 *     LOW score (100) once `moves >= 1`, so a single click drives the
 *     terminal-win branch with a worse-than-stored result.
 *   - `beforeEach` pre-seeds `cards-and-such:stats:v1` with `perGame[id].best
 *     = 1000`, simulating a prior, better personal-best.
 *   - We assert directly against the storage blob — `bucket.best` must
 *     remain at the pre-seeded 1000, not collapse to the new (worse) 100.
 *   - `played` / `wins` are still expected to bump (the round was played
 *     and won), pinning that `recordGame` did run — the assertion really
 *     is "best did not regress", not "recordGame was a no-op".
 *   - The page mounts with `?quickstart=1` to skip the setup screen and
 *     land directly in the playing phase.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; isTerminal returns a
// LOW positive-score payload once `moves >= 1`, so a single dispatch
// reaches the terminal-win branch with a score worse than the pre-seeded
// best. The branch in PlayPage calls `recordGame(plugin.id, score, won,
// time)`, which feeds `Math.max(prev.best, score)` for `best`.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "record-game-best-noregress-fixture";
  const PRE_SEEDED_BEST = 1000;
  const WORSE_SCORE = 100;
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Record Game Best No-Regress Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin pinning the best-score no-regression invariant.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: WORSE_SCORE } : null,
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
  return { TEST_GAME_ID, PRE_SEEDED_BEST, WORSE_SCORE, fixturePlugin };
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
  // Pre-seed a prior, better personal-best so the upcoming worse-scoring
  // win has something to (incorrectly) clobber if the no-regression guard
  // were ever broken. Shape matches `StatsState` in stats.ts so `loadStats`
  // accepts it without falling back to defaults.
  const seed = {
    totalPlayed: 5,
    totalWins: 5,
    longestStreak: 5,
    currentStreak: 5,
    perGame: {
      [hoisted.TEST_GAME_ID]: {
        played: 5,
        wins: 5,
        best: hoisted.PRE_SEEDED_BEST,
      },
    },
    perCategory: {},
    daysPlayed: [],
    unlocked: [],
  };
  localStorage.setItem(STATS_KEY, JSON.stringify(seed));
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage recordGame best-score does not regress (W700)", () => {
  it("preserves perGame[id].best when the new score is worse", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    // Sanity: the seed wrote what we expect before the page mounts.
    const before = JSON.parse(localStorage.getItem(STATS_KEY) as string) as {
      perGame: Record<string, { played: number; wins: number; best: number }>;
    };
    expect(before.perGame[hoisted.TEST_GAME_ID]?.best).toBe(
      hoisted.PRE_SEEDED_BEST,
    );

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

    const raw = localStorage.getItem(STATS_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string) as {
      perGame: Record<string, { played: number; wins: number; best: number }>;
    };

    const bucket = parsed.perGame[hoisted.TEST_GAME_ID]!;
    expect(bucket).toBeDefined();

    // The round happened — `played` and `wins` should bump past the seed.
    // Without this, the test could pass via a coincidence where `recordGame`
    // never ran at all (e.g. a wrong route key), giving a false negative
    // for the actual invariant.
    expect(bucket.played).toBeGreaterThanOrEqual(6);
    expect(bucket.wins).toBeGreaterThanOrEqual(6);

    // The actual invariant: best is NOT clobbered by the worse score.
    // `Math.max(1000, 100) === 1000`, so the stored value must still be
    // the pre-seeded 1000 — never the freshly-played-but-worse 100.
    expect(bucket.best).toBe(hoisted.PRE_SEEDED_BEST);
    expect(bucket.best).toBeGreaterThan(hoisted.WORSE_SCORE);
  });
});

// Reference React so this file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
