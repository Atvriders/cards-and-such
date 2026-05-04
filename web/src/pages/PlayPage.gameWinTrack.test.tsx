/**
 * Unit test for the PlayPage game-win analytics breadcrumb (W787).
 *
 * Observable behavior:
 *   When a reducer dispatch transitions the game into a terminal state with
 *   a positive score, the `dispatch` callback (PlayPage.tsx ~line 1240)
 *   fires `track("game.win", { gameId, score, elapsed })`. That breadcrumb
 *   is the only signal in the local event ring that the most recent
 *   reducer step was the *winning* step (vs. e.g. an external game-over
 *   callback or a non-winning terminal), so a regression that drops it —
 *   for instance, a refactor that splits the terminal-detection branch and
 *   forgets to rewire the track call on one path — would silently delete
 *   a useful diagnostic without breaking the visible UI.
 *
 *   Sibling PlayPage tests cover other tracked events (`play.hint`,
 *   `play.undo`, `play.redo`, `play.replay_saved`, `play.favorite`,
 *   `play.print`, `friend.copy_code`) and `analytics.test.ts` covers
 *   `game.start`, but no test exercises the `game.win` breadcrumb fired
 *   by the dispatch-driven terminal path. This test fills that gap.
 *
 * Strategy:
 *   - Mirror the win-banner fixture pattern from
 *     `PlayPage.printTrack.test.tsx` (a hoisted plugin with a `WIN`-action
 *     reducer + positive `isTerminal` score) so the page reaches
 *     `phase === "ended"` deterministically via a single dispatch.
 *   - Use the analytics module's public `getEvents()` / `clearEvents()`
 *     helpers (instead of mocking the module) so the assertion matches the
 *     published contract: callers reading the ring downstream see this
 *     event with the expected props.
 *   - Clear the ring immediately *after* `start-game` and *before* the win
 *     dispatch so the assertion below is unambiguously about the dispatch
 *     terminal path — not the prior `app.boot` / `route.change` /
 *     `game.start` breadcrumbs from earlier in this same test.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin. Minimal reducer/isTerminal pair that flips into
// a winning terminal state with a known positive score on a single
// dispatched action — enough to drive PlayPage to `phase === "ended"` via
// the dispatch path that owns the `game.win` track call.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "game-win-track-fixture";
  const WIN_SCORE = 42;
  type State = { won: boolean };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Game Win Track Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the game.win analytics test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ won: false }),
    reducer: (s: State, action: { type: string }): State =>
      action?.type === "WIN" ? { won: true } : s,
    isTerminal: (s: State) => (s.won ? { score: WIN_SCORE } : null),
    component: ({ dispatch }: { dispatch: (a: { type: string }) => void }) => (
      <div>
        <button
          type="button"
          data-testid="fixture-win"
          onClick={() => dispatch({ type: "WIN" })}
        >
          win
        </button>
      </div>
    ),
  };
  return { TEST_GAME_ID, WIN_SCORE, fixturePlugin };
});

// PlayPage looks the plugin up via the games registry — substitute the
// fixture so we don't drag the real game catalogue into the test.
vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs that jsdom doesn't implement; stubbing it
// keeps the win-banner render fast and side-effect-free.
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

describe("PlayPage game.win analytics (W787)", () => {
  it("dispatching a winning action records exactly one game.win event with gameId, score, and elapsed", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    const { getEvents, clearEvents } = await import(
      "../platform/analytics.js"
    );

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the fixture's
    // dispatch-driven win button is mounted.
    fireEvent.click(screen.getByTestId("start-game"));

    // Clear the ring right before the win dispatch so the assertion below
    // is unambiguously about the terminal-branch track call — not the
    // prior app.boot / route.change / game.start breadcrumbs from earlier
    // in this same test.
    clearEvents();

    act(() => {
      fireEvent.click(screen.getByTestId("fixture-win"));
    });

    // Filter to the event of interest so any future unrelated breadcrumb
    // the win handler grows alongside this one doesn't false-positive a
    // regression here.
    const winEvts = getEvents().filter((e) => e.name === "game.win");
    expect(winEvts.length).toBe(1);

    // gameId and score must match the fixture exactly. `elapsed` is
    // wall-clock-derived and therefore non-deterministic — assert it's a
    // finite non-negative number rather than a literal value, which would
    // make this test brittle to scheduler jitter.
    const props = winEvts[0]?.props as
      | { gameId: string; score: number; elapsed: number }
      | undefined;
    expect(props?.gameId).toBe(hoisted.TEST_GAME_ID);
    expect(props?.score).toBe(hoisted.WIN_SCORE);
    expect(typeof props?.elapsed).toBe("number");
    expect(Number.isFinite(props?.elapsed)).toBe(true);
    expect((props?.elapsed ?? -1) >= 0).toBe(true);

    // Cross-check no `game.lose` slipped through — the reducer's score is
    // strictly positive, so the `term.score > 0` branch in PlayPage must
    // pick game.win not game.lose. A regression that flips the comparison
    // would surface here even if the win-event count alone passed.
    const loseEvts = getEvents().filter((e) => e.name === "game.lose");
    expect(loseEvts.length).toBe(0);
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
