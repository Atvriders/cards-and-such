/**
 * Unit test for PlayPage header timer persistence in the ended phase (W903).
 *
 * Companion / inverse to W897 (`PlayPage.timerHiddenSetup.test.tsx`):
 *   - W897 asserts the `play-timer` is *absent* during `phase === "setup"`.
 *   - W903 (this test) asserts the `play-timer` is *present* during
 *     `phase === "ended"` — confirming the gate is `playing || ended`,
 *     not just `playing`. Without this assertion, a regression that
 *     narrowed the gate to `phase === "playing"` (dropping the timer the
 *     instant a win/loss banner appears) would silently pass: every
 *     existing timer test runs while the round is in progress.
 *
 * Why pin "ended" specifically:
 *   The header timer doubles as the canonical elapsed-time readout that
 *   the end panel and post-win share image both reference. If the gate
 *   collapses to `playing` only, the end banner can race-mount with the
 *   timer already unmounted, and the elapsed value the player sees in
 *   the win/loss banner becomes inconsistent with what the header showed
 *   one frame earlier. Keeping the timer in the DOM through "ended" is
 *   the contract that makes that read stable.
 *
 * Strategy:
 *   Mirror W897's hoisted-fixture + registry-mock pattern, but use
 *   W845/W805's winning-fixture shape: reducer increments `moves`, and
 *   `isTerminal` returns `{ score: 100 }` once `moves >= 1` so a single
 *   click drives PlayPage into the terminal-win branch. `?quickstart=1`
 *   skips the setup screen so we don't have to click `start-game`. After
 *   the win-dispatch click, assert that `final-score` is mounted (anchor
 *   that confirms phase actually transitioned to "ended" — without this
 *   anchor a regression that prevented the win from registering would
 *   leave the timer mounted in the still-playing phase and false-pass)
 *   AND `play-timer` (and its inner `play-timer-current`) are still in
 *   the DOM.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin. vi.hoisted runs before vi.mock factories evaluate
// so the closure capture below is safe despite looking like a TDZ pattern.
// Reducer increments `moves`; isTerminal returns a positive-score payload
// (score: 100) once `moves >= 1`, so one click drives PlayPage into the
// terminal-win branch and the JSX flips to `phase === "ended"`.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "timer-ended-phase-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Timer Ended Phase Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for header timer ended-phase persistence.",
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

// PlayPage looks the plugin up via the games registry — substitute the
// fixture so we don't drag the real game catalogue into the test.
vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// win-path render side-effect-free.
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

describe("PlayPage header timer persistence in ended phase (W903)", () => {
  it("keeps play-timer in the DOM after a win (phase === ended)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    // `?quickstart=1` skips the setup screen so the fixture component
    // (and its win-dispatcher button) mounts immediately.
    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition sanity: timer is mounted during the playing phase.
    // If this fails the test setup is wrong — bail out early rather than
    // chase a phantom regression in the ended-phase branch.
    expect(screen.getByTestId("play-timer")).toBeTruthy();

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns `{ score: 100 }`, and the
    // PlayPage end-effect transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Anchor: `final-score` only renders inside the `phase === "ended"`
    // branch. Its presence confirms the phase actually transitioned, so
    // the play-timer assertion below is *specifically* about the ended
    // phase rather than a still-playing render.
    expect(screen.getByTestId("final-score")).toBeTruthy();

    // The contract under test (W903): the header timer must STILL be
    // in the DOM during `phase === "ended"`. We assert both the wrapper
    // and the inner readout so a future refactor that splits them still
    // gets caught here.
    expect(screen.queryByTestId("play-timer")).not.toBeNull();
    expect(screen.queryByTestId("play-timer-current")).not.toBeNull();
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
