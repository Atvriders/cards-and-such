/**
 * Unit test for the PlayPage Ctrl/Cmd+Y hotkey that triggers redo (W767).
 *
 * Observable behavior:
 *   While the game is in the "playing" phase, pressing Ctrl+Y (and Cmd+Y
 *   on macOS) calls `redo()` (PlayPage.tsx ~line 1334). `redo()` pops the
 *   most-recent frame off the redo stack and re-applies the forward
 *   reducer state. The handler explicitly skips the binding when focus
 *   is in an `<input>`/`<textarea>`/`<select>` or a contenteditable
 *   surface so users editing fields get the browser's native text-redo.
 *   Sibling W765 already covers Ctrl+Z (undo) — Ctrl+Y is the redo gap.
 *
 * Strategy:
 *   - Hoisted counter fixture whose reducer returns a fresh object on
 *     every "inc" so PlayPage's `next !== s` guard pushes an undo frame
 *     per dispatch (same pattern as PlayPage.hotkeyCtrlZ / redoButton).
 *   - Drive game state forward by dispatching 2 "inc" actions through
 *     the fixture component so the undo stack has 2 frames and the
 *     fixture count reads 2.
 *   - Fire one Ctrl+Z keydown to undo (count = 1, redo stack now has
 *     one frame to step forward into).
 *   - Fire one Ctrl+Y keydown on `window`. The handler at PlayPage.tsx
 *     ~line 1334 matches `(e.ctrlKey || e.metaKey) && key === "y" &&
 *     !e.shiftKey` and dispatches `redo()`. Assert the count walked
 *     forward from 1 back to 2 — that's the load-bearing observable
 *     proving the hotkey is wired to `redo()` (and is independent of
 *     Ctrl+Shift+Z, which is the alternate redo binding).
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
  const TEST_GAME_ID = "ctrly-hotkey-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Ctrl+Y Hotkey Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the Ctrl+Y redo hotkey test.",
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

describe("PlayPage Ctrl+Y hotkey triggers redo (W767)", () => {
  it("Ctrl+Y after Ctrl+Z walks the action count forward by one frame", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the
    // window-level keydown handler that owns the Ctrl+Y binding mounts.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fx-count").textContent).toBe("0");

    // Dispatch 2 "inc" actions so the undo ring buffer has 2 frames and
    // the fixture's reducer state has advanced to count === 2.
    const incBtn = screen.getByTestId("fx-inc");
    for (let i = 0; i < 2; i++) fireEvent.click(incBtn);
    expect(screen.getByTestId("fx-count").textContent).toBe("2");

    // Ctrl+Z to undo: count rolls back to 1 and the popped frame goes
    // onto the redo stack so the redo button enables.
    fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    expect(screen.getByTestId("fx-count").textContent).toBe("1");
    expect(
      (screen.getByTestId("play-redo-btn") as HTMLButtonElement).disabled,
    ).toBe(false);

    // Fire one Ctrl+Y keydown on window. The handler at PlayPage.tsx
    // ~line 1334 matches `(e.ctrlKey || e.metaKey) && key === "y" &&
    // !shiftKey`, dispatching `redo()`. The redo frame pops back into
    // the undo stack and the reducer state walks forward from 1 to 2.
    fireEvent.keyDown(window, { key: "y", ctrlKey: true });

    // Load-bearing assertion: count walked forward by exactly one frame.
    // If this said "1" the Ctrl+Y binding wasn't wired (or was eaten by
    // an unrelated handler); if it said "0" Ctrl+Y triggered an extra
    // undo instead of redo.
    expect(screen.getByTestId("fx-count").textContent).toBe("2");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
