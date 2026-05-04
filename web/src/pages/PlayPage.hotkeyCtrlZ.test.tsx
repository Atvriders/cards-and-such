/**
 * Unit test for the PlayPage Ctrl/Cmd+Z hotkey that triggers undo (W765).
 *
 * Observable behavior:
 *   While the game is in the "playing" phase, pressing Ctrl+Z (and Cmd+Z
 *   on macOS) calls `undo()` (PlayPage.tsx ~line 1324). `undo()` pops the
 *   most-recent frame off the unified undo ring buffer and restores the
 *   prior reducer state. The handler explicitly skips the binding when
 *   focus is in an `<input>`/`<textarea>`/`<select>` or a contenteditable
 *   surface so users editing fields get the browser's native text-undo.
 *   Sibling tests already cover F (W736), I (W740), D (W744), R (W748),
 *   Shift+R (W753), T (W756), and Esc — Ctrl+Z is the next gap.
 *
 * Strategy:
 *   - Hoisted counter fixture whose reducer returns a fresh object on
 *     every "inc" so PlayPage's `next !== s` guard pushes an undo frame
 *     per dispatch (same pattern as PlayPage.undoGating).
 *   - Drive game state forward by dispatching 3 "inc" actions through
 *     the fixture component so the undo stack has 3 frames and the
 *     fixture count reads 3.
 *   - Fire one `Ctrl+Z` keydown on `window`. The handler is registered
 *     with the default capture (third-arg false) on window, so a window
 *     dispatch hits it. Assert the count rolled back to 2 (one frame
 *     popped) — that's the load-bearing observable that proves the
 *     hotkey wired to `undo()` and not redo().
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
  const TEST_GAME_ID = "ctrlz-hotkey-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Ctrl+Z Hotkey Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the Ctrl+Z undo hotkey test.",
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

describe("PlayPage Ctrl+Z hotkey triggers undo (W765)", () => {
  it("pressing Ctrl+Z while playing rolls the action count back by one frame", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the
    // window-level keydown handler that owns the Ctrl+Z binding mounts.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fx-count").textContent).toBe("0");

    // Dispatch 3 "inc" actions so the undo ring buffer has 3 frames and
    // the fixture's reducer state has advanced to count === 3.
    const incBtn = screen.getByTestId("fx-inc");
    for (let i = 0; i < 3; i++) fireEvent.click(incBtn);
    expect(screen.getByTestId("fx-count").textContent).toBe("3");
    expect(
      (screen.getByTestId("play-undo-btn") as HTMLButtonElement).disabled,
    ).toBe(false);

    // Fire one Ctrl+Z keydown on window. The handler at PlayPage.tsx
    // ~line 1316 listens on window with the default (non-capture) phase
    // and matches `(e.ctrlKey || e.metaKey) && key === "z" && !shiftKey`,
    // dispatching `undo()`. One frame pops off undoStack, the prior
    // reducer state is restored, and count rolls back from 3 to 2.
    fireEvent.keyDown(window, { key: "z", ctrlKey: true });

    // Load-bearing assertion: count rolled back by exactly one frame.
    // If this said "0" it would be Shift+R / replay; if it stayed at "3"
    // the binding wasn't wired (e.g. a stale handler ignoring ctrlKey).
    expect(screen.getByTestId("fx-count").textContent).toBe("2");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
