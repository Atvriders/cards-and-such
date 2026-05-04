/**
 * Unit test for the PlayPage end-banner final-score win modifier class (W1336).
 *
 * Observable behavior:
 *   When the game reaches a winning terminal state, PlayPage.tsx (~line 2687)
 *   renders the final-score element with
 *   `className={`final-score${isWin ? " final-score--win" : ""}`}` — i.e. the
 *   `final-score--win` modifier is appended only on win. Sibling tests cover:
 *     - W805: the testid + numeric value of `final-score`.
 *     - W1094: the `final-score` BASE class via `classList.contains`.
 *   Neither pins the `final-score--win` MODIFIER class, even though that
 *   modifier is the dedicated CSS hook (PlayPage.css ~line 934) that drives
 *   the celebratory color/glow on the score number. A regression that
 *   dropped the modifier (e.g. always emitted just "final-score") or
 *   renamed it to something like `final-score__win` would silently strip
 *   the win-state styling while every existing test continued to pass.
 *
 * Strategy:
 *   Mirror the hoisted fixture pattern from W1094 (PlayPage.finalScoreClass
 *   .test.tsx): a one-action plugin whose reducer increments `moves` and
 *   whose `isTerminal` returns a positive-score winning payload once
 *   `moves >= 1`. Use `?quickstart=1` so PlayPage skips the setup screen.
 *   After the win dispatch, assert that the testid node carries the
 *   `final-score--win` modifier specifically (via classList.contains, so
 *   class-order or future modifier additions don't trip the test).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — same shape as W1094's win-banner fixture.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-banner-win-modifier-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Banner Win Modifier Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the final-score--win modifier test.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 9 } : null,
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
  vi.restoreAllMocks();
});

describe("PlayPage end-banner final-score--win modifier (W1336)", () => {
  it("appends the `final-score--win` modifier class on the final-score element after a win", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: final-score is NOT mounted before the round ends.
    expect(screen.queryByTestId("final-score")).toBeNull();

    // Drive to terminal-win with a positive score so `isWin` is true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    const finalScore = screen.getByTestId("final-score");

    // The contract: on a win, the element must carry the
    // `final-score--win` modifier so it picks up the celebratory CSS rule
    // (PlayPage.css ~line 934). classList.contains is tolerant of
    // class-order or future modifier additions while still pinning the
    // win-state styling hook. A regression that dropped the modifier
    // entirely (or renamed it to `final-score__win`/`final-score-win`)
    // is caught here.
    expect(finalScore.classList.contains("final-score--win")).toBe(true);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
