/**
 * Unit test for the PlayPage undo button gating (W689).
 *
 * Verifies that the Undo button is disabled at the start of a fresh game
 * (no moves yet means the undo stack is empty) and becomes enabled as
 * soon as the player dispatches a move that produces a new state.
 *
 * Strategy:
 *   - `vi.hoisted` builds a counter fixture plugin whose reducer returns
 *     a *new* object on every "inc" so the undo ring buffer captures a
 *     frame (PlayPage skips identical references — see the `next !== s`
 *     guard in the dispatch path around line 1208).
 *   - The Undo button is `data-testid="play-undo-btn"`; it starts
 *     disabled (no undo frames) and must become enabled after a single
 *     "inc" dispatch.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted counter fixture. Reducer returns a fresh object on every "inc" so
// PlayPage's `next !== s` guard pushes an undo frame.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "undo-gating-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Undo Gating Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the undo-button gating test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, a: Action): State =>
      a.type === "inc" ? { count: s.count + 1 } : s,
    isTerminal: () => null,
    component: ({
      state,
      dispatch,
    }: {
      state: State;
      dispatch: (a: Action) => void;
    }) => (
      <div>
        <span data-testid="fx-count">{state.count}</span>
        <button
          data-testid="fx-inc"
          type="button"
          onClick={() => dispatch({ type: "inc" })}
        >
          inc
        </button>
      </div>
    ),
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship — null-stub keeps any
// stray render path side-effect-free.
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

describe("PlayPage undo button gating (W689)", () => {
  it("undo button is disabled at start and enabled after the first move", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so the fixture's component mounts.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fx-count").textContent).toBe("0");

    // Undo starts disabled — no moves means no undo frames on the stack.
    const undoBtn = screen.getByTestId("play-undo-btn") as HTMLButtonElement;
    expect(undoBtn.disabled).toBe(true);

    // Dispatch one "inc" to record a move; the prior state lands on the
    // undo ring buffer and the button must flip enabled.
    fireEvent.click(screen.getByTestId("fx-inc"));
    expect(screen.getByTestId("fx-count").textContent).toBe("1");
    expect(undoBtn.disabled).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
