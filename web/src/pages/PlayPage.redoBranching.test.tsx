/**
 * Unit test for the PlayPage redo-stack branching invariant (W695).
 *
 * Covers an edge case the existing PlayPage.redoButton.test.tsx does NOT:
 * when the user undoes an action and then dispatches a NEW action instead
 * of redoing, the previously-stashed redo frame must be discarded so the
 * timeline branches cleanly. After the new dispatch, the Redo button must
 * be disabled and clicking it must be a no-op.
 *
 * This is the `setRedoStack((prev) => (prev.length === 0 ? prev : []))`
 * guard around line 1217 of PlayPage.tsx — the "fresh user action drops
 * stale redo frames" rule that keeps undo/redo from teleporting state
 * across diverged branches.
 *
 * Strategy mirrors the sibling redoButton test: a hoisted counter fixture
 * whose reducer returns a fresh object each "inc" so the undo ring buffer
 * actually captures frames.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "redo-branching-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Redo Branching Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the redo-branching test.",
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

describe("PlayPage redo branching (W695)", () => {
  it("dispatching a new action after undo clears the redo stack", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fx-count").textContent).toBe("0");

    const redoBtn = screen.getByTestId("play-redo-btn") as HTMLButtonElement;

    // Inc → 1, undo → 0 (parks 1 on redo stack so redo would jump to 1).
    fireEvent.click(screen.getByTestId("fx-inc"));
    expect(screen.getByTestId("fx-count").textContent).toBe("1");
    fireEvent.click(screen.getByTestId("play-undo-btn"));
    expect(screen.getByTestId("fx-count").textContent).toBe("0");
    expect(redoBtn.disabled).toBe(false);

    // Branch the timeline: dispatch a fresh action instead of redoing.
    // The reducer takes us from 0 → 1 again, but along a NEW branch — the
    // previously-parked redo frame must be discarded.
    fireEvent.click(screen.getByTestId("fx-inc"));
    expect(screen.getByTestId("fx-count").textContent).toBe("1");

    // Redo must now be disabled because the stale redo frame was dropped
    // by the fresh-action guard. Clicking it is a no-op (count stays 1,
    // not jumping to some impossible value from the abandoned branch).
    expect(redoBtn.disabled).toBe(true);
    fireEvent.click(redoBtn);
    expect(screen.getByTestId("fx-count").textContent).toBe("1");
  });
});

void React;
