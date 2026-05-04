/**
 * Unit test for the PlayPage restart / new-game button (W719).
 *
 * Verifies that clicking the in-toolbar Restart button (data-testid
 * "play-restart-btn") tears down the current game state and re-installs
 * the plugin's initialState — i.e. the move counter returns to 0 and the
 * Undo button flips back to disabled because the undo ring buffer was
 * cleared by `startWithSeed` (PlayPage.tsx line 831).
 *
 * Strategy:
 *   - Reuse the counter-fixture pattern from the undo-gating test: a
 *     reducer that returns a fresh object on every "inc" so PlayPage's
 *     `next !== s` guard pushes a frame onto the undo stack.
 *   - Click `start-game` to enter playing phase.
 *   - Dispatch one "inc" so count = 1 and the undo button is enabled.
 *   - Click `play-restart-btn`. With elapsed ≈ 0 and actionCount = 1
 *     (≤ 5), `confirmIfInProgress` short-circuits to true synchronously
 *     so no ConfirmDialog mounts — but the click handler is async so we
 *     still wrap it in `act` and flush a microtask.
 *   - Assert count returns to 0 and the undo button is disabled again,
 *     proving the initial state was re-installed and the undo stack
 *     was cleared.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted counter fixture — reducer returns a fresh object on every "inc"
// so PlayPage records an undo frame for each dispatch.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "new-game-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "New Game Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the restart-button test.",
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

describe("PlayPage restart button (W719)", () => {
  it("resets game state and clears the undo stack when clicked", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so the fixture's component mounts.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fx-count").textContent).toBe("0");

    // Drive game state to a known non-initial position: one "inc" sets
    // count to 1 and pushes a frame onto the undo ring buffer.
    fireEvent.click(screen.getByTestId("fx-inc"));
    expect(screen.getByTestId("fx-count").textContent).toBe("1");
    const undoBtn = screen.getByTestId("play-undo-btn") as HTMLButtonElement;
    expect(undoBtn.disabled).toBe(false);

    // Click the in-toolbar Restart button. With elapsed ≈ 0 and
    // actionCount = 1 (≤ 5), confirmIfInProgress() returns true without
    // mounting a ConfirmDialog — but `replay` is async, so wrap the
    // click in act + a flushed microtask to settle React.
    await act(async () => {
      fireEvent.click(screen.getByTestId("play-restart-btn"));
      await Promise.resolve();
    });

    // initialState was re-installed: count is 0 again.
    expect(screen.getByTestId("fx-count").textContent).toBe("0");

    // setUndoStack([]) inside startWithSeed cleared the ring buffer, so
    // the undo button must flip back to disabled.
    expect(
      (screen.getByTestId("play-undo-btn") as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
