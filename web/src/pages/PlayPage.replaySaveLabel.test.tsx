/**
 * Unit test for the win-banner save-replay button label flip (W827).
 *
 * Observable behavior:
 *   The `play-save-replay` button rendered inside the win banner reads
 *   "Save replay" while no replay has been archived for the current
 *   round, and flips to "Replay saved" after the click handler runs.
 *   The flip is the user's only confirmation that the click did
 *   anything: the persistence side-effect lands silently in
 *   localStorage, so a regression that fails to set `replaySaved`
 *   (e.g. removing `setReplaySaved(true)` during a refactor of the
 *   click handler) would leave the user thinking the click no-op'd
 *   even though storage was updated.
 *
 *   PlayPage.replaySave.test.tsx covers the persistence shape and the
 *   FIFO eviction; PlayPage.replaySaveTrack.test.tsx covers the
 *   analytics breadcrumb. Neither asserts on the button's textual
 *   transition, so the label flip has been an untested edge.
 *
 * Strategy:
 *   - Reuse the same `vi.hoisted` win-after-one-move fixture pattern
 *     as the sibling replay-save tests so a single dispatch drops
 *     PlayPage straight into the terminal-win branch that mounts the
 *     save button. Drive `?quickstart=1` to skip the setup screen.
 *   - Read `textContent` off the button before and after the click
 *     so the assertion is on the actual flip — both directions —
 *     rather than just the post-click state. That way a regression
 *     where the button always reads "Replay saved" (e.g. inverted
 *     ternary) also fails the test, not only the no-op case.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; isTerminal returns a
// positive-score payload as soon as `moves >= 1`, so a single dispatch
// from the fixture button drives PlayPage into the terminal-win branch
// that exposes the `play-save-replay` button. Same shape as the sibling
// replay-save tests so any future fixture-level change there is easy
// to mirror here.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "replay-save-label-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Replay Save Label Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for replay-save button label flip.",
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
// terminal-win render side-effect-free, mirroring the sibling tests.
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

describe("PlayPage win-banner save-replay button label (W827)", () => {
  it("reads 'Save replay' before click and flips to 'Replay saved' after", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Drive the round to terminal-win so the save button mounts. The
    // quickstart flag means setup is skipped entirely; this is the
    // only click we need to reach `isWin`.
    fireEvent.click(screen.getByTestId("fx-win"));

    const saveBtn = screen.getByTestId("play-save-replay");

    // Pre-click: button advertises the action that will happen on click.
    expect(saveBtn.textContent).toBe("Save replay");

    fireEvent.click(saveBtn);

    // Post-click: same DOM node (button isn't unmounted/re-mounted),
    // updated label confirms the save took effect from the user's POV.
    expect(saveBtn.textContent).toBe("Replay saved");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
