/**
 * Pinning test for PlayPage replay-save double-click behavior (W839).
 *
 * INTENTIONAL BEHAVIOR PIN — DO NOT BLINDLY "FIX":
 *   Today, the `play-save-replay` button in the win banner has no
 *   `disabled` guard. After the first click, `replaySaved` flips to
 *   `true` and the label changes to "Replay saved", but the button
 *   remains clickable. A second click invokes `saveReplay(...)` again,
 *   which appends another entry to the `cards-replays` localStorage
 *   key. Net effect: clicking twice persists TWO entries for the same
 *   round.
 *
 *   W831 surfaced this as a UX hole. The team chose to DOCUMENT rather
 *   than fix, so this test pins the current behavior. If a future
 *   change adds e.g. `disabled={replaySaved}` (or any other dedupe
 *   guard) on the button, this test will fail — at which point the
 *   correct response is to FLIP the assertion to expect length === 1
 *   on the second click, NOT to revert the production fix.
 *
 * Strategy mirrors PlayPage.replaySave.test.tsx: a hoisted fixture
 * plugin whose reducer increments `moves` and whose `isTerminal`
 * fires after a single dispatch, dropping us into the win banner
 * that mounts the `play-save-replay` button.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "replay-save-double-click-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Replay Save Double Click Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for replay-save double-click pinning.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 100 } : null,
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

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// terminal-win render side-effect-free.
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

describe("PlayPage replay save double-click pins current behavior (W839)", () => {
  it("appends a second cards-replays entry on a second click (no dedupe guard today)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    const { REPLAYS_KEY } = await import("../platform/replays.js");

    expect(localStorage.getItem(REPLAYS_KEY)).toBeNull();

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Drive the round to terminal-win so the save-replay button mounts.
    fireEvent.click(screen.getByTestId("fx-win"));

    const saveBtn = screen.getByTestId("play-save-replay");

    // First click: one entry persisted, as expected.
    fireEvent.click(saveBtn);
    {
      const raw = localStorage.getItem(REPLAYS_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw as string) as unknown[];
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(1);
    }

    // Second click on the SAME button. The label is now "Replay saved",
    // but the button has no `disabled` guard — clicking again still
    // invokes `saveReplay(...)`, appending another entry. This assertion
    // PINS that behavior. If a future change adds a dedupe guard, flip
    // this to `toBe(1)` rather than reverting the guard.
    fireEvent.click(saveBtn);
    {
      const raw = localStorage.getItem(REPLAYS_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw as string) as Array<{ gameId: string }>;
      expect(parsed.length).toBe(2);
      // Both entries are for the same game — confirms it really is a
      // duplicate, not e.g. a separate replay from a different round.
      expect(parsed[0].gameId).toBe(hoisted.TEST_GAME_ID);
      expect(parsed[1].gameId).toBe(hoisted.TEST_GAME_ID);
    }
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
