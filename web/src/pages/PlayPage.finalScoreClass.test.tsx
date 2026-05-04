/**
 * Unit test for the PlayPage win-banner final-score CSS class (W1094).
 *
 * Observable behavior:
 *   When the game reaches a winning terminal state, PlayPage.tsx (~line 2687)
 *   renders the final-score element with `className="final-score
 *   final-score--win"`. W805 covers the testid + numeric value, but the CSS
 *   class itself is what hooks the element into PlayPage.css for the
 *   end-banner styling (font-size, color, win-state highlight). A regression
 *   that renamed the class to `.score-final`, dropped the base class, or
 *   only emitted the `--win` modifier without the base would silently
 *   un-style the headline number while every existing test continued to
 *   pass.
 *
 * Strategy:
 *   Mirror W805's hoisted fixture pattern verbatim — minimal plugin whose
 *   reducer increments `moves` and whose `isTerminal` returns a positive
 *   score once `moves >= 1` so a single click drives PlayPage into the
 *   terminal-win branch. Then assert `classList.contains("final-score")`
 *   on the testid node — the *base* class is the contract that ties the
 *   element to its CSS rule, independent of any win/loss modifier.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — same shape as W805's win-banner fixture.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "final-score-class-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Final Score Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the final-score class test.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 7 } : null,
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

describe("PlayPage win-banner final-score CSS class (W1094)", () => {
  it("renders the final-score element with the `final-score` base class after a win", async () => {
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

    // Drive to terminal-win.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    const finalScore = screen.getByTestId("final-score");

    // The contract: the element must carry the `final-score` base class
    // so it picks up the end-banner CSS rule. classList.contains is
    // tolerant of class-order or modifier-class additions while still
    // pinning the styling hook.
    expect(finalScore.classList.contains("final-score")).toBe(true);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
