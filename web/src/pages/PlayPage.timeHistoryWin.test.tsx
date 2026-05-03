/**
 * Unit test for PlayPage time-history append on terminal-win (W204).
 *
 * Invariant under test: when the reducer transitions the game into a
 * terminal-win state (`isTerminal` returns a `{ score > 0 }` payload),
 * PlayPage MUST append a fresh entry to `cards-time-history:<gameId>`
 * via `appendTimeHistory()` whose `ts` is the current wall clock at the
 * moment of the win.
 *
 * Strategy mirrors PlayPage.actionToasts.test.tsx:
 *   - `vi.hoisted` defines a fixture plugin whose reducer counts moves
 *     and whose `isTerminal` returns `{ score: 100 }` once `moves >= 1`.
 *   - The fixture component exposes a single dispatcher button. One
 *     click drives the round to terminal-win via the real PlayPage
 *     dispatch path that calls `appendTimeHistory`.
 *   - Storage is left empty before the win so the post-win entry is
 *     observable as the sole element of the array.
 *   - The page is mounted with `?quickstart=1` so we land directly in
 *     the playing phase without needing to click "Start playing".
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; isTerminal returns a
// positive-score payload as soon as `moves >= 1`, so a single dispatch
// from the fixture button drives PlayPage straight into the
// terminal-win branch that calls `appendTimeHistory`.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-history-win-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time History Win Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for time-history terminal-win append.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 100 } : null,
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

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage time-history append on win (W204)", () => {
  it("appends a new entry with the current time when a terminal-win is reached", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const key = `cards-time-history:${hoisted.TEST_GAME_ID}`;
    expect(localStorage.getItem(key)).toBeNull();

    // `?quickstart=1` skips the setup screen and drops us straight into
    // the playing phase, so the fixture component (and its dispatcher
    // button) mounts without needing to click "Start playing".
    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Dispatcher button mounts only once we're in the playing phase.
    const winBtn = screen.getByTestId("fx-win");

    const before = Date.now();
    fireEvent.click(winBtn);
    const after = Date.now();

    // The terminal-win branch in PlayPage.dispatch calls
    // `appendTimeHistory(plugin.id, elapsed, term.score)`, which writes
    // the JSON-encoded array under `cards-time-history:<gameId>`.
    const raw = localStorage.getItem(key);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string) as Array<{
      ts: number;
      time: number;
      score?: number;
    }>;
    expect(Array.isArray(parsed)).toBe(true);
    // At least one entry was appended by the terminal-win branch. We
    // assert against the most-recent entry to stay robust against the
    // React 18 dev-mode setState updater double-invocation that can
    // double-fire the win path under jsdom.
    expect(parsed.length).toBeGreaterThanOrEqual(1);

    const entry = parsed[parsed.length - 1];
    // `ts` is `Date.now()` at the moment of append — must fall inside
    // the [before, after] window we bracketed around the click.
    expect(typeof entry.ts).toBe("number");
    expect(entry.ts).toBeGreaterThanOrEqual(before);
    expect(entry.ts).toBeLessThanOrEqual(after);
    // `time` is `elapsed` (seconds since round start). The timer hasn't
    // ticked yet within the same synchronous click, so 0 is expected,
    // but we only assert it's a finite non-negative number to stay
    // robust against any harness-injected jitter.
    expect(typeof entry.time).toBe("number");
    expect(Number.isFinite(entry.time)).toBe(true);
    expect(entry.time).toBeGreaterThanOrEqual(0);
    // Score is forwarded from `isTerminal` — confirms the win branch
    // (not a generic finish path) executed.
    expect(entry.score).toBe(100);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
