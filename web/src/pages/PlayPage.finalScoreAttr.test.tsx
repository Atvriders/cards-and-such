/**
 * Unit test for the PlayPage win-banner final-score aria-label (W1115).
 *
 * Observable behavior:
 *   When the game reaches a winning terminal state, PlayPage.tsx (~line 2689)
 *   renders the final-score element with
 *   `aria-label={`Final score ${finalScore}`}`. W805 covers the testid +
 *   numeric text content, and W1094 covers the base CSS class. The
 *   aria-label is the accessibility contract: screen readers announce
 *   "Final score N" rather than the bare number, giving blind/low-vision
 *   players the same context sighted players get from the surrounding
 *   "Score" label. A regression that dropped the aria-label, swapped it
 *   for a static string ("Final score") with no number, or used a
 *   different prefix would silently break the screen-reader experience
 *   while every visual assertion continued to pass.
 *
 * Strategy:
 *   Mirror W1094's hoisted fixture pattern verbatim — minimal plugin
 *   whose reducer increments `moves` and whose `isTerminal` returns a
 *   distinctive score (42) once `moves >= 1` so a single click drives
 *   PlayPage into the terminal-win branch. Then assert the exact
 *   aria-label string `"Final score 42"` on the testid node so we pin
 *   both the prefix wording and the dynamic-number interpolation.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — same shape as W1094's win-banner fixture, with a
// distinctive score so we can pin the dynamic-number interpolation.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "final-score-attr-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Final Score Attr Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the final-score aria-label test.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 42 } : null,
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

describe("PlayPage win-banner final-score aria-label (W1115)", () => {
  it("renders the final-score element with aria-label `Final score N` after a win", async () => {
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

    // The contract: the element must carry an aria-label that reads
    // "Final score 42" so screen readers announce the score with
    // context, not just the bare number.
    expect(finalScore.getAttribute("aria-label")).toBe("Final score 42");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
