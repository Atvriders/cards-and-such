/**
 * Unit test for the PlayPage redo button click (W208 / W620).
 *
 * Verifies the symmetry invariant: dispatching an action advances the
 * counter, the Undo button rolls it back, and clicking the Redo button
 * flips the state forward again to the post-dispatch value.
 *
 * Strategy:
 *   - `vi.hoisted` builds a counter fixture plugin whose reducer returns
 *     a *new* object on every "inc" so the undo ring buffer actually
 *     captures a frame (PlayPage skips identical references — see the
 *     `next !== s` guard in the dispatch path around line 1208).
 *   - The fixture's component renders the live counter via the injected
 *     `state` prop plus an "inc" button wired to `dispatch`, so we can
 *     assert the visible value before/after each undo/redo step.
 *   - The Redo button is `data-testid="play-redo-btn"`; it starts
 *     disabled (no redo frames), becomes enabled after a click of the
 *     Undo button, and clicking it must restore the post-dispatch state.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted counter fixture. The reducer must return a fresh object on every
// "inc" so PlayPage's `next !== s` guard pushes an undo frame; returning the
// same reference would silently drop the frame and the test would race.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "redo-button-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Redo Button Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the redo-button click test.",
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
// stray render path side-effect-free even though we never reach the win
// banner here.
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

describe("PlayPage redo button click (W208)", () => {
  it("undo via button then redo button click flips state back to post-dispatch value", async () => {
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

    // Redo starts disabled — no frames have been parked on the redo stack.
    const redoBtn = screen.getByTestId("play-redo-btn") as HTMLButtonElement;
    expect(redoBtn.disabled).toBe(true);

    // Dispatch one "inc" to advance the counter and seed the undo ring.
    fireEvent.click(screen.getByTestId("fx-inc"));
    expect(screen.getByTestId("fx-count").textContent).toBe("1");

    // Undo via the visible button. This rolls state back AND parks the
    // post-dispatch state on the redo stack, enabling the Redo button.
    fireEvent.click(screen.getByTestId("play-undo-btn"));
    expect(screen.getByTestId("fx-count").textContent).toBe("0");
    expect(redoBtn.disabled).toBe(false);

    // Click Redo: state must flip back to the post-dispatch value (1) and
    // the redo stack drains, so the button disables again.
    fireEvent.click(redoBtn);
    expect(screen.getByTestId("fx-count").textContent).toBe("1");
    expect(redoBtn.disabled).toBe(true);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
