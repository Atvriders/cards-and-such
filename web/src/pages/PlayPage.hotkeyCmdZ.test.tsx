/**
 * Unit test for the PlayPage Cmd+Z (metaKey) hotkey that triggers undo (W770).
 *
 * Observable behavior:
 *   The keydown handler at PlayPage.tsx ~line 1316-1338 gates on
 *   `(e.ctrlKey || e.metaKey)`, so Cmd+Z (macOS-style modifier) is a
 *   distinct code path from Ctrl+Z covered by W765's sibling test —
 *   either branch alone must dispatch `undo()`. This test fires
 *   `metaKey: true` *without* `ctrlKey`, proving the metaKey arm of
 *   the OR is exercised and not silently dead. Without this coverage a
 *   regression that tightened the guard to `e.ctrlKey && !e.metaKey`
 *   (or vice versa) would slip past CI even though Mac users would lose
 *   their undo hotkey entirely.
 *
 * Strategy:
 *   - Reuse W765's hoisted counter fixture pattern: reducer returns a
 *     fresh object on every "inc" so PlayPage's `next !== s` guard
 *     pushes an undo frame per dispatch.
 *   - Drive game state forward by dispatching 2 "inc" actions so the
 *     undo ring buffer has 2 frames and count reads 2.
 *   - Fire one `Cmd+Z` keydown on window with `metaKey: true` (and
 *     ctrlKey omitted/false). Assert count walks back to 1 — one frame
 *     popped, prior state restored. If this said "0" the handler ran
 *     twice or replay fired; if it stayed at "2" the metaKey path is
 *     dead and the test catches the regression.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted counter fixture so vi.mock factories below can reference it.
// vi.hoisted runs before the imports the factories close over.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "cmdz-hotkey-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Cmd+Z Hotkey Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the Cmd+Z undo hotkey test.",
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

describe("PlayPage Cmd+Z hotkey triggers undo (W770)", () => {
  it("pressing Cmd+Z (metaKey only) while playing rolls the action count back by one frame", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the
    // window-level keydown handler that owns the Cmd+Z binding mounts.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fx-count").textContent).toBe("0");

    // Dispatch 2 "inc" actions so the undo ring buffer has 2 frames and
    // the fixture's reducer state has advanced to count === 2.
    const incBtn = screen.getByTestId("fx-inc");
    for (let i = 0; i < 2; i++) fireEvent.click(incBtn);
    expect(screen.getByTestId("fx-count").textContent).toBe("2");
    expect(
      (screen.getByTestId("play-undo-btn") as HTMLButtonElement).disabled,
    ).toBe(false);

    // Fire one Cmd+Z keydown on window — metaKey only, NOT ctrlKey. The
    // handler at PlayPage.tsx ~line 1317 gates on `(e.ctrlKey ||
    // e.metaKey)`, so the metaKey branch must independently dispatch
    // `undo()`. One frame pops off undoStack, the prior reducer state
    // is restored, and count rolls back from 2 to 1.
    fireEvent.keyDown(window, { key: "z", metaKey: true });

    // Load-bearing assertion: count rolled back by exactly one frame
    // via the metaKey branch. If this said "0" the handler also fired
    // through the ctrlKey arm (double-fire) or replay ran; if it stayed
    // at "2" the metaKey path is dead — exactly the regression W765's
    // ctrlKey-only test would miss.
    expect(screen.getByTestId("fx-count").textContent).toBe("1");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
