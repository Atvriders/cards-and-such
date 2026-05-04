/**
 * Unit test for the PlayPage game-lose analytics breadcrumb (W792).
 *
 * Observable behavior:
 *   The dispatch-driven terminal branch in PlayPage.tsx (~line 1240) fires
 *   `track("game.win" | "game.lose", { gameId, score, elapsed })`, picking
 *   the event name with `term.score > 0 ? "game.win" : "game.lose"`. W787
 *   pinned the win path; this test pins the *loss* path — the terminal
 *   case where `isTerminal` returns a non-null object whose `score` is not
 *   strictly positive (e.g. zero, the natural "you lost / no points"
 *   outcome). A regression that drops the lose breadcrumb (e.g. a refactor
 *   that early-returns the win branch and forgets the else, or one that
 *   guards the track call behind `term.score > 0`) would silently delete
 *   diagnostic signal without breaking visible UI.
 *
 *   Sibling W787 (`PlayPage.gameWinTrack.test.tsx`) covers the win path
 *   exclusively and also asserts zero lose events for a positive-score
 *   finish; this file is its inverse — exactly one lose event for a
 *   zero-score terminal, zero win events.
 *
 * Strategy:
 *   - Mirror W787's hoisted-plugin fixture, but make `isTerminal` return
 *     `{ score: 0 }` once the LOSE action runs. Source contract at
 *     PlayPage.tsx:1219-1244 only requires the return be truthy with a
 *     numeric `score`; `0` exercises the `else` branch that emits
 *     `game.lose` (the comparison is `term.score > 0`, so `0` falls
 *     through).
 *   - Use the analytics module's public `getEvents()` / `clearEvents()`
 *     helpers (no module mock) so the assertion matches the published
 *     contract that downstream consumers actually observe.
 *   - Clear the ring after `start-game` and before the lose dispatch so
 *     the count assertion is unambiguously about the terminal-branch
 *     track call, not the earlier app.boot / route.change / game.start
 *     breadcrumbs from this same test.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin. Minimal reducer/isTerminal pair that flips into
// a *losing* terminal state (score === 0) on a single dispatched action —
// enough to drive PlayPage to `phase === "ended"` via the dispatch path
// that owns the `game.lose` track call.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "game-lose-track-fixture";
  const LOSE_SCORE = 0;
  type State = { lost: boolean };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Game Lose Track Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the game.lose analytics test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ lost: false }),
    reducer: (s: State, action: { type: string }): State =>
      action?.type === "LOSE" ? { lost: true } : s,
    // PlayPage's terminal check: any non-null object marks "game over"; the
    // `term.score > 0` discriminator picks win vs. lose. Returning
    // `{ score: 0 }` is the canonical losing-terminal shape.
    isTerminal: (s: State) => (s.lost ? { score: LOSE_SCORE } : null),
    component: ({ dispatch }: { dispatch: (a: { type: string }) => void }) => (
      <div>
        <button
          type="button"
          data-testid="fixture-lose"
          onClick={() => dispatch({ type: "LOSE" })}
        >
          lose
        </button>
      </div>
    ),
  };
  return { TEST_GAME_ID, LOSE_SCORE, fixturePlugin };
});

// PlayPage looks the plugin up via the games registry — substitute the
// fixture so we don't drag the real game catalogue into the test.
vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs that jsdom doesn't implement; stubbing it
// keeps the end-banner render fast and side-effect-free. (The lose path
// doesn't trigger confetti, but PlayPage still imports it eagerly.)
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

describe("PlayPage game.lose analytics (W792)", () => {
  it("dispatching a non-winning terminal action records exactly one game.lose event with gameId, score, and elapsed", async () => {
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
    // dispatch-driven lose button is mounted.
    fireEvent.click(screen.getByTestId("start-game"));

    // Clear the ring right before the lose dispatch so the assertion below
    // is unambiguously about the terminal-branch track call — not the
    // prior app.boot / route.change / game.start breadcrumbs from earlier
    // in this same test.
    clearEvents();

    act(() => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // Filter to the event of interest so any future unrelated breadcrumb
    // the lose handler grows alongside this one doesn't false-positive a
    // regression here.
    const loseEvts = getEvents().filter((e) => e.name === "game.lose");
    expect(loseEvts.length).toBe(1);

    // gameId and score must match the fixture exactly. `elapsed` is
    // wall-clock-derived and therefore non-deterministic — assert it's a
    // finite non-negative number rather than a literal value, which would
    // make this test brittle to scheduler jitter.
    const props = loseEvts[0]?.props as
      | { gameId: string; score: number; elapsed: number }
      | undefined;
    expect(props?.gameId).toBe(hoisted.TEST_GAME_ID);
    expect(props?.score).toBe(hoisted.LOSE_SCORE);
    expect(typeof props?.elapsed).toBe("number");
    expect(Number.isFinite(props?.elapsed)).toBe(true);
    expect((props?.elapsed ?? -1) >= 0).toBe(true);

    // Cross-check no `game.win` slipped through — the reducer's score is
    // exactly zero, so the `term.score > 0` branch in PlayPage must pick
    // game.lose not game.win. A regression that flips the comparison (e.g.
    // `>= 0`) would surface here even if the lose-event count alone
    // passed, since both events would fire.
    const winEvts = getEvents().filter((e) => e.name === "game.win");
    expect(winEvts.length).toBe(0);
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
