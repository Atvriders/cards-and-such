/**
 * Unit test for PlayPage action-toast queue (W164).
 *
 * Verifies the two observable invariants documented at the top of
 * `PlayPage.tsx`:
 *   1. Dispatching an action with a `type` produces a toast in the
 *      `play-toasts` live region. The label comes from `describeAction`,
 *      so dispatching `{ type: "draw-card" }` surfaces "Draw Card" — i.e.
 *      confirmation that the action ran.
 *   2. The toast queue is capped at MAX_TOASTS (= 3) and each toast
 *      auto-dismisses after TOAST_TTL_MS (= 2000ms).
 *
 * Strategy:
 *   - `vi.hoisted` defines a fixture plugin whose Game.tsx wires four
 *     buttons to the injected `dispatch` prop, one per distinct action
 *     type. The hoisted block is used so the same plugin instance is
 *     handed to the `../games/registry.js` mock and is also reachable
 *     from inside `it()` if needed for follow-on assertions.
 *   - Fake timers (`vi.useFakeTimers`) are installed AFTER the page is
 *     in the playing phase; installing them earlier freezes the
 *     start-phase microtasks the React tree depends on (same caveat as
 *     PlayPage.hint.test.tsx).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Four dispatcher buttons let the test push more toasts
// than MAX_TOASTS so the cap is exercised. The reducer is a no-op — we
// only care that `dispatch()` runs and emits the toast.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Action Toast Fixture",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Action-toast queue test fixture.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (s: { moves: number }) => s,
    isTerminal: () => null,
    component: ({ dispatch }: { dispatch: (a: Action) => void }) => (
      <div>
        <button
          data-testid="fx-draw"
          type="button"
          onClick={() => dispatch({ type: "draw-card" })}
        >
          draw
        </button>
        <button
          data-testid="fx-flip"
          type="button"
          onClick={() => dispatch({ type: "flip-card" })}
        >
          flip
        </button>
        <button
          data-testid="fx-move"
          type="button"
          onClick={() => dispatch({ type: "move-card" })}
        >
          move
        </button>
        <button
          data-testid="fx-undo"
          type="button"
          onClick={() => dispatch({ type: "undo-move" })}
        >
          undo
        </button>
      </div>
    ),
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PlayPage action toasts (W164)", () => {
  it("shows a toast on dispatch, caps at 3, and auto-dismisses after 2s", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so the fixture's Game.tsx mounts and
    // its dispatch-wired buttons exist in the DOM.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fx-draw")).toBeTruthy();

    // Install fake timers AFTER the playing phase has committed — the
    // start-phase effects rely on real microtask scheduling.
    vi.useFakeTimers();

    // (1) A single dispatch produces exactly one toast whose label is
    // the prettified action type — confirmation that the action ran.
    fireEvent.click(screen.getByTestId("fx-draw"));
    expect(screen.getAllByTestId(/^play-toast-/).length).toBe(1);
    expect(screen.getByTestId("play-toast-0").textContent).toBe("Draw Card");

    // (2) Cap. After four dispatches there should still be only 3
    // toasts visible (MAX_TOASTS); the oldest ("Draw Card") was dropped.
    fireEvent.click(screen.getByTestId("fx-flip"));
    fireEvent.click(screen.getByTestId("fx-move"));
    fireEvent.click(screen.getByTestId("fx-undo"));
    const visible = screen.getAllByTestId(/^play-toast-/);
    expect(visible.length).toBe(3);
    const labels = visible.map((el) => el.textContent);
    expect(labels).toEqual(["Flip Card", "Move Card", "Undo Move"]);

    // (3) Auto-dismiss. Each toast is scheduled to clear at TTL after
    // its own push, so advancing past 2000ms from the most recent push
    // drains the queue entirely.
    act(() => {
      vi.advanceTimersByTime(2001);
    });
    expect(screen.queryAllByTestId(/^play-toast-/).length).toBe(0);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
