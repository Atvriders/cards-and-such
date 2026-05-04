/**
 * Unit test for the win-banner save-replay analytics breadcrumb (W729).
 *
 * Observable behavior:
 *   When the user reaches a terminal-win state and clicks the
 *   `play-save-replay` button, PlayPage fires a
 *   `track("play.replay_saved", { gameId, seed })` analytics breadcrumb
 *   in addition to persisting the replay payload to localStorage. That
 *   breadcrumb is the only signal the local event-log surfaces to mark
 *   that a replay was archived from the win banner, so a regression that
 *   drops it (e.g. a refactor that splits the save handler into the
 *   replays module but forgets to rewire the track call) would silently
 *   delete a useful diagnostic without breaking the visible UI.
 *
 *   PlayPage.replaySave.test.tsx already covers the persistence side
 *   (entry shape, FIFO eviction). It does NOT inspect the analytics
 *   ring, so the `track` side-effect of the click handler has been an
 *   untested edge.
 *
 * Strategy:
 *   - Reuse the same `vi.hoisted` win-after-one-move fixture pattern as
 *     PlayPage.replaySave.test.tsx so a single dispatch drops PlayPage
 *     into the terminal-win branch that mounts the save button.
 *   - Drive `?quickstart=1` so we skip setup and start straight into the
 *     playing phase without an extra start click that would emit other
 *     breadcrumbs we'd then have to filter.
 *   - Use the analytics module's public `getEvents()` / `clearEvents()`
 *     helpers (instead of mocking the module) so the assertion matches
 *     the published contract: callers reading the ring downstream see
 *     this event with the expected props.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; isTerminal returns a
// positive-score payload as soon as `moves >= 1`, so a single dispatch
// from the fixture button drives PlayPage into the terminal-win branch
// that exposes the `play-save-replay` button. Same shape as
// PlayPage.replaySave.test.tsx so any future fixture-level change there
// is easy to mirror here.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "replay-save-track-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Replay Save Track Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for replay-save analytics breadcrumb.",
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
// terminal-win render side-effect-free, mirroring the sibling test.
vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

// Stable seed so the props payload is deterministic for triage if a
// future regression surfaces in CI logs.
const FIXED_SEED = 42;

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage win-banner save-replay analytics (W729)", () => {
  it("clicking play-save-replay records a play.replay_saved event with gameId and seed", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    const { getEvents, clearEvents } = await import(
      "../platform/analytics.js"
    );

    // Start from a known-empty ring so we don't conflate boot-time
    // breadcrumbs (`app.boot`, `route.change`) with the click we're
    // about to make. clearEvents wipes both the in-memory ring and the
    // localStorage mirror -- exactly what we want pre-render.
    clearEvents();

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

    // Drive the round to terminal-win so the save button mounts. The
    // quickstart query param means setup is skipped entirely; this is
    // the ONLY click we need to reach `isWin`.
    fireEvent.click(screen.getByTestId("fx-win"));

    // The render+win path fires unrelated breadcrumbs (game.start,
    // game.win). Clear once more right before the save click so the
    // assertion below is unambiguously about the save handler.
    clearEvents();

    const saveBtn = screen.getByTestId("play-save-replay");
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    // Filter to the event of interest so any future unrelated
    // breadcrumb the click handler grows alongside this one (e.g.
    // `replay.share`) doesn't false-positive a regression here.
    const replayEvts = getEvents().filter(
      (e) => e.name === "play.replay_saved",
    );
    expect(replayEvts.length).toBe(1);
    expect(replayEvts[0]?.props).toEqual({
      gameId: hoisted.TEST_GAME_ID,
      seed: FIXED_SEED,
    });
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
