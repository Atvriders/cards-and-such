/**
 * Unit test for the PlayPage end-banner "share seed" button (W678).
 *
 * Observable behavior:
 *   The post-game end panel exposes a `share-seed-end-btn` once the
 *   reducer transitions to a terminal-win state. Clicking it must call
 *   `navigator.clipboard.writeText` with a deep-link URL embedding the
 *   current seed as `?seed=<seed>`. This is the same `shareSeed` handler
 *   covered by W670 for the toolbar `share-seed-btn`, but the end-banner
 *   variant has its own visibility rule (only mounts after the game
 *   ends), so it warrants a dedicated test of the win-path.
 *
 * Strategy mirrors PlayPage.timeHistoryWin.test.tsx (for driving a win)
 * and PlayPage.seedCopy.test.tsx (for clipboard stubbing):
 *   - `vi.hoisted` defines a fixture plugin whose reducer increments a
 *     move counter and whose `isTerminal` returns a positive-score
 *     payload as soon as `moves >= 1`. One dispatch from the fixture
 *     button drives PlayPage straight into the terminal-win branch.
 *   - `?quickstart=1` skips the setup screen so the fixture component
 *     mounts directly in the playing phase.
 *   - `navigator.clipboard.writeText` is stubbed via `Object.defineProperty`
 *     (jsdom marks the property non-writable by default) with a vi.fn
 *     that resolves so the awaited call inside `shareSeed` settles.
 *   - After the win, assert the end-banner share button is present, click
 *     it, and pin both the call shape and the seed-bearing query param.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; isTerminal returns a
// positive-score payload once `moves >= 1`, so a single dispatch from
// the fixture button drives PlayPage into the terminal-win branch and
// makes `phase === "ended"` with `isWin === true`, mounting the
// `share-seed-end-btn` inside the end panel.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "share-end-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Share End Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for end-banner share-seed clipboard test.",
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
// terminal-win render side-effect-free even though we render the win
// banner here.
vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

// Fixed seed so the asserted query-param value is deterministic and
// easy to triage if a future failure prints the writeText arguments.
const FIXED_SEED = 77;

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage end-banner share-seed button copies seed URL after win (W678)", () => {
  it("clicking share-seed-end-btn after a terminal-win calls clipboard.writeText with a URL containing the current seed", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    // Stub the clipboard. `navigator.clipboard` is non-writable in jsdom
    // by default, hence the defineProperty dance — same pattern used by
    // the seedCopy / friendCodeCopy sibling tests.
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    // `?quickstart=1` skips the setup screen so the fixture component
    // (and its win-dispatcher button) mounts immediately. `?seed=77` so
    // the URL we expect copied is deterministic.
    render(
      <MemoryRouter
        initialEntries={[
          `/play/${hoisted.TEST_GAME_ID}?seed=${FIXED_SEED}&quickstart=1`,
        ]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: end-banner share button is NOT mounted before the
    // game ends — that's the visibility contract this test is pinning.
    expect(screen.queryByTestId("share-seed-end-btn")).toBeNull();

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns `{ score: 100 }`, and the
    // PlayPage end-effect transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Visibility-after-win assertion: the end-banner share button must
    // now be in the document.
    const shareEndBtn = screen.getByTestId("share-seed-end-btn");
    expect(shareEndBtn).toBeTruthy();

    await act(async () => {
      fireEvent.click(shareEndBtn);
    });

    // The whole point of the test: writeText must be called with the
    // deep-link URL the user expects to paste. URL shape is
    // `${origin}/play/${plugin.id}?seed=${seed}` — substring-check the
    // seed query param so jsdom's origin can vary without breaking the
    // test, while still pinning the seed contract.
    expect(writeText).toHaveBeenCalledTimes(1);
    const arg = writeText.mock.calls[0]?.[0] as string;
    expect(typeof arg).toBe("string");
    expect(arg).toContain(`/play/${hoisted.TEST_GAME_ID}`);
    expect(arg).toContain(`seed=${FIXED_SEED}`);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
