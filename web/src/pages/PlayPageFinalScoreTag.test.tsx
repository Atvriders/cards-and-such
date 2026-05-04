/**
 * Unit test for the PlayPage end-banner final-score wrapper tagName (W1406).
 *
 * Observable behavior:
 *   When the game reaches a winning terminal state, PlayPage.tsx (~line 2686)
 *   renders the final-score node as a `<div>`:
 *
 *     <div
 *       className={`final-score${isWin ? " final-score--win" : ""}`}
 *       data-testid="final-score"
 *       aria-label={`Final score ${finalScore}`}
 *     >
 *       {finalScore}
 *     </div>
 *
 *   Sibling tests cover:
 *     - W805 : testid + numeric text content.
 *     - W1094: the `final-score` BASE class via classList.contains.
 *     - W1115: the `aria-label="Final score N"` accessibility prefix.
 *     - W1336: the `final-score--win` modifier class.
 *   None of them pin the *element type*. A regression that swapped the
 *   wrapper from `<div>` to `<span>`, `<p>`, or a heading element would
 *   silently break the layout contract (the surrounding flex column
 *   relies on a block-level child, and screen readers may emit different
 *   role hints for inline vs. block) while every existing class /
 *   aria-label / value assertion continued to pass.
 *
 * Strategy:
 *   Mirror the W1094 / W1115 / W1336 hoisted fixture pattern verbatim — a
 *   minimal plugin whose reducer increments `moves` and whose `isTerminal`
 *   returns a positive score once `moves >= 1` so a single click drives
 *   PlayPage into the terminal-win branch. Then assert
 *   `finalScore.tagName === "DIV"` on the testid node so we pin the
 *   element type independent of class / aria-label / text-content
 *   regressions.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — same shape as W1094's win-banner fixture.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "final-score-tag-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Final Score Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the final-score wrapper tagName test.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 11 } : null,
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

describe("PlayPage end-banner final-score wrapper tagName (W1406)", () => {
  it("renders the final-score node as a `<div>` element after a win", async () => {
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

    // The contract: the final-score wrapper must be a block-level <div>.
    // tagName is uppercase in HTML documents per the DOM spec, so we
    // compare against "DIV" rather than "div".
    expect(finalScore.tagName).toBe("DIV");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
