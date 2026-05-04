/**
 * Unit test for the PlayPage Cmd+Y (metaKey) hotkey that triggers redo (W773).
 *
 * Observable behavior:
 *   While the game is in the "playing" phase, pressing Cmd+Y on macOS
 *   calls `redo()` (PlayPage.tsx ~line 1334). The handler guard is
 *   `(e.ctrlKey || e.metaKey)`, so the metaKey path is a separate code
 *   branch from the ctrlKey path covered by W767. `redo()` pops the
 *   most-recent frame off the redo stack and re-applies the forward
 *   reducer state. The handler explicitly skips the binding when focus
 *   is in an `<input>`/`<textarea>`/`<select>` or a contenteditable
 *   surface so users editing fields get the browser's native text-redo.
 *   Sibling W767 covers Ctrl+Y; W769 covers Ctrl+Shift+Z; this test
 *   closes the metaKey gap on the y-without-shift redo binding.
 *
 * Strategy:
 *   - Hoisted counter fixture whose reducer returns a fresh object on
 *     every "inc" so PlayPage's `next !== s` guard pushes an undo frame
 *     per dispatch (same pattern as PlayPage.hotkeyCtrlY).
 *   - Drive game state forward by dispatching 2 "inc" actions through
 *     the fixture component so the undo stack has 2 frames and the
 *     fixture count reads 2.
 *   - Fire one Cmd+Z keydown to undo (count = 1, redo stack now has
 *     one frame to step forward into) — exercises the metaKey undo
 *     path en route, but the load-bearing assertion is on Cmd+Y.
 *   - Fire one Cmd+Y keydown on `window`. The handler at PlayPage.tsx
 *     ~line 1334 matches `(e.ctrlKey || e.metaKey) && key === "y" &&
 *     !e.shiftKey` and dispatches `redo()`. Assert the count walked
 *     forward from 1 back to 2 — that's the load-bearing observable
 *     proving the metaKey hotkey is wired to `redo()`.
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
  const TEST_GAME_ID = "cmdy-hotkey-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Cmd+Y Hotkey Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the Cmd+Y redo hotkey test.",
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

describe("PlayPage Cmd+Y hotkey triggers redo (W773)", () => {
  it("Cmd+Y after Cmd+Z walks the action count forward by one frame", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the
    // window-level keydown handler that owns the Cmd+Y binding mounts.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fx-count").textContent).toBe("0");

    // Dispatch 2 "inc" actions so the undo ring buffer has 2 frames and
    // the fixture's reducer state has advanced to count === 2.
    const incBtn = screen.getByTestId("fx-inc");
    for (let i = 0; i < 2; i++) fireEvent.click(incBtn);
    expect(screen.getByTestId("fx-count").textContent).toBe("2");

    // Cmd+Z to undo: count rolls back to 1 and the popped frame goes
    // onto the redo stack so the redo button enables. metaKey is the
    // macOS-equivalent modifier, exercising the `e.ctrlKey || e.metaKey`
    // guard branch.
    fireEvent.keyDown(window, { key: "z", metaKey: true });
    expect(screen.getByTestId("fx-count").textContent).toBe("1");
    expect(
      (screen.getByTestId("play-redo-btn") as HTMLButtonElement).disabled,
    ).toBe(false);

    // Fire one Cmd+Y keydown on window. The handler at PlayPage.tsx
    // ~line 1334 matches `(e.ctrlKey || e.metaKey) && key === "y" &&
    // !shiftKey`, dispatching `redo()`. The redo frame pops back into
    // the undo stack and the reducer state walks forward from 1 to 2.
    fireEvent.keyDown(window, { key: "y", metaKey: true });

    // Load-bearing assertion: count walked forward by exactly one frame.
    // If this said "1" the Cmd+Y (metaKey) binding wasn't wired (or was
    // eaten by an unrelated handler); if it said "0" Cmd+Y triggered an
    // extra undo instead of redo.
    expect(screen.getByTestId("fx-count").textContent).toBe("2");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
