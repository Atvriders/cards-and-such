/**
 * Unit test for PlayPage replay-save persistence (W392).
 *
 * Invariant under test: when a round reaches a terminal-win state and the
 * user clicks the `play-save-replay` button in the win banner, PlayPage
 * MUST persist a single replay entry under the `cards-replays`
 * localStorage key carrying `{ seed, actions, gameId }` for the just-
 * completed round.
 *
 * Strategy mirrors PlayPage.timeHistoryWin.test.tsx:
 *   - `vi.hoisted` defines a fixture plugin whose reducer increments a
 *     `moves` counter and whose `isTerminal` returns `{ score: 100 }`
 *     once `moves >= 1`. One click drives PlayPage straight into the
 *     terminal-win branch that renders the "Save replay" button.
 *   - Storage is left empty before the click so the post-save entry is
 *     observable as the sole element of the persisted array.
 *   - The page mounts with `?quickstart=1` to skip the setup screen and
 *     drop us directly into the playing phase.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; isTerminal returns a
// positive-score payload as soon as `moves >= 1`, so a single dispatch
// from the fixture button drives PlayPage into the terminal-win branch
// that exposes the `play-save-replay` button.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "replay-save-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Replay Save Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for replay-save persistence.",
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

describe("PlayPage replay save persists (W392)", () => {
  it("appends a single cards-replays entry with seed/actions/gameId on click", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    expect(localStorage.getItem("cards-replays")).toBeNull();

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

    // The win banner's save button is only rendered on `isWin`.
    const saveBtn = screen.getByTestId("play-save-replay");
    fireEvent.click(saveBtn);

    const raw = localStorage.getItem("cards-replays");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string) as Array<{
      gameId: string;
      seed: number;
      actions: unknown[];
    }>;
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(1);

    const entry = parsed[0];
    expect(entry.gameId).toBe(hoisted.TEST_GAME_ID);
    expect(typeof entry.seed).toBe("number");
    expect(Array.isArray(entry.actions)).toBe(true);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
