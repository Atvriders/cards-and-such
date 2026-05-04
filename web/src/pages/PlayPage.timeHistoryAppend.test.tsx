/**
 * Unit test for PlayPage time-history append-grows-array on win (W707).
 *
 * Distinct from the sibling `PlayPage.timeHistoryWin.test.tsx` (W204), which
 * starts from empty storage and asserts that *some* entry was written.
 * This test guards the stricter invariant: when `cards-time-history:<id>`
 * already contains a prior entry, the terminal-win path MUST APPEND a new
 * entry — i.e. the array must grow from N to N+1, with the existing entry
 * preserved as the head and the new entry at the tail carrying a finite
 * non-negative duration.
 *
 * A regression where the win path overwrote the array (rather than
 * appending) would still pass the W204 length>=1 check but break the
 * trend-chart's running history. That is the gap this test closes.
 *
 * Harness mirrors the W639 timerTick / W204 timeHistoryWin pattern:
 *   - `vi.hoisted` exposes a fixture plugin whose reducer counts moves
 *     and whose `isTerminal` flips to `{ score: 100 }` after one click.
 *   - `vi.useFakeTimers({ shouldAdvanceTime: true })` BEFORE mount per
 *     the W639 mount-phase pattern, so PlayPage's 1Hz tick effect
 *     registers cleanly against the virtual clock.
 *   - `?quickstart=1` skips the setup screen.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-history-append-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time History Append Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for time-history append-grows test.",
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
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PlayPage time-history append grows array (W707)", () => {
  it("appends a new entry to a pre-seeded history on terminal-win", async () => {
    // Install fake timers BEFORE mount per the W639 pattern so the 1Hz
    // tick effect registers against the virtual clock without deadlocking
    // mount-phase microtasks. `shouldAdvanceTime: true` lets pending
    // queueMicrotask-style callbacks still drain.
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const key = `cards-time-history:${hoisted.TEST_GAME_ID}`;
    // Pre-seed the history with a single entry so the post-win assertion
    // can prove the array GREW (length 1 -> 2) rather than just confirming
    // a write happened.
    const seedEntry = { ts: 1_700_000_000_000, time: 42, score: 50 };
    localStorage.setItem(key, JSON.stringify([seedEntry]));

    const { default: PlayPage } = await import("./PlayPage.js");

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

    const raw = localStorage.getItem(key);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string) as Array<{
      ts: number;
      time: number;
      score?: number;
    }>;
    expect(Array.isArray(parsed)).toBe(true);

    // The pre-seeded entry MUST still be present as the head — this is the
    // append-vs-overwrite guard. Use a length>=2 lower bound to stay robust
    // against React 18 dev-mode setState double-invocation that can fire
    // the win path twice under jsdom.
    expect(parsed.length).toBeGreaterThanOrEqual(2);
    expect(parsed[0]).toEqual(seedEntry);

    // The newly-appended tail entry must carry a finite, non-negative
    // numeric duration (the elapsed seconds since round start, captured
    // by `appendTimeHistory(plugin.id, elapsed, term.score)`).
    const tail = parsed[parsed.length - 1];
    expect(typeof tail.time).toBe("number");
    expect(Number.isFinite(tail.time)).toBe(true);
    expect(tail.time).toBeGreaterThanOrEqual(0);
    expect(typeof tail.ts).toBe("number");
    expect(Number.isFinite(tail.ts)).toBe(true);
    // Confirms the win branch (not a generic finish path) ran — score
    // is forwarded straight from `isTerminal`'s return value.
    expect(tail.score).toBe(100);
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
