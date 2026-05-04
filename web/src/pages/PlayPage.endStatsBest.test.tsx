/**
 * Unit test for the PlayPage win-banner end-stats-best value (W814).
 *
 * Observable behavior:
 *   When the game reaches a terminal-win, PlayPage.tsx (~line 2703) renders
 *   a `<dd data-testid="end-stats-best">{formatTime(bestTime)}…</dd>` inside
 *   the end-stats list. `bestTime` is initialised from `localStorage` key
 *   `cards-best-times` (a `Record<gameId, seconds>`) on mount and only
 *   replaced via `recordBest` when the *current* round beats the stored
 *   value. Sibling tests already cover `final-score` (W805), `end-stats-time`
 *   (W809), the new-record badge plumbing, and the per-game persistence
 *   round-trip — but no test pins the rendered "best" readout on the
 *   non-record path. A regression that wires this `<dd>` to a stale
 *   variable, the wrong formatter, or always overwrites bestTime would slip
 *   through every adjacent test.
 *
 * Strategy:
 *   Mirror the hoisted fixture from W805 (PlayPage.winBannerScore.test.tsx)
 *   so a single dispatcher click drives PlayPage to terminal-win. Pre-seed
 *   `cards-best-times` with a *smaller* time (5s) than the elapsed time we
 *   produce (7s) — that way `recordBest` returns isRecord=false, the seeded
 *   value is preserved, and the readout reflects the stored PR rather than
 *   the just-finished round. Install fake timers BEFORE mount per the W639
 *   pattern so the 1Hz tick effect arms against the virtual clock; advance
 *   7s, click win, and assert `end-stats-best` text is "00:05" — the exact
 *   `mm:ss` shape the PlayPage `formatTime` helper produces.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; isTerminal returns a winning
// payload once `moves >= 1`, so a single dispatch from the fixture button
// drives PlayPage into the terminal-win branch and renders the win banner.
// The exact score is irrelevant — we only assert the best-time readout —
// but a positive value keeps us on the win path so the win-only end-stats
// "Best" row is mounted at all.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-stats-best-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Stats Best Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the win-banner end-stats-best test.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 1 } : null,
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

// PlayPage looks the plugin up via the games registry — substitute the
// fixture so we don't drag the real game catalogue into the test.
vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// win-banner render fast and side-effect-free.
vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

// Pre-seeded stored best for our fixture's gameId. 5 seconds is *strictly*
// less than the 7s we let the virtual clock accrue before the win, so the
// `recordBest` path sees isRecord=false and preserves the seeded value —
// the exact "displays the stored PR after a slower win" surface this test
// pins. Bumping either constant requires the other to stay smaller.
const STORED_BEST_SECONDS = 5;
const STORED_BEST_FORMATTED = "00:05";
const ELAPSED_SECONDS = 7;

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PlayPage win-banner end-stats-best value (W814)", () => {
  it("renders the stored best time formatted as mm:ss when the round did not break the record", async () => {
    // Pre-seed the per-game best-times map BEFORE PlayPage mounts so its
    // useState initializer (`readBestTime(plugin.id)`) picks the value up
    // on first render. The shape — `Record<gameId, seconds>` under the
    // single key `cards-best-times` — mirrors the writer in PlayPage.tsx.
    localStorage.setItem(
      "cards-best-times",
      JSON.stringify({ [hoisted.TEST_GAME_ID]: STORED_BEST_SECONDS }),
    );

    // Install fake timers BEFORE mount per W639/W809 pattern so the 1Hz
    // `setInterval` that drives `elapsed` registers against the virtual
    // clock from the start. `shouldAdvanceTime: true` keeps mount-phase
    // microtasks alive so the quickstart effect can transition `phase`
    // to "playing" normally.
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { default: PlayPage } = await import("./PlayPage.js");

    // `?quickstart=1` skips the setup screen so the fixture component
    // (and its win-dispatcher button) mounts immediately and the 1Hz
    // elapsed-counter effect arms in the same render pass.
    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: end-stats-best is NOT mounted before the game ends —
    // it lives inside the `phase === "ended" && isWin` branch of the JSX.
    expect(screen.queryByTestId("end-stats-best")).toBeNull();

    // Advance the virtual clock past the seeded PR so the round will NOT
    // break the record. 7s > 5s, so `recordBest(7)` returns isRecord=false
    // and `bestTime` stays at the seeded 5s — exactly the path we want
    // to pin.
    act(() => {
      vi.advanceTimersByTime(ELAPSED_SECONDS * 1000);
    });

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns a winning payload, and the
    // PlayPage end-effect transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Visibility-after-win assertion: the end-stats-best node must now
    // be mounted. A regression that dropped the data-testid would
    // surface here even if the visible text remained correct.
    const endStatsBest = screen.getByTestId("end-stats-best");
    expect(endStatsBest).toBeTruthy();

    // The whole point of the test: the rendered text must be the
    // mm:ss-formatted *stored* best — not the just-finished round's
    // elapsed (7s) and not the placeholder em-dash. Because the round
    // did not beat the PR, no "New record!" badge renders, so the
    // trimmed textContent is exactly the formatted seeded value.
    expect(endStatsBest.textContent?.trim()).toBe(STORED_BEST_FORMATTED);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
