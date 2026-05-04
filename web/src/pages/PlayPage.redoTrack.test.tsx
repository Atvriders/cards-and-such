/**
 * Unit test for the PlayPage redo-button analytics breadcrumb (W732).
 *
 * Observable behavior:
 *   When the user has parked a frame on the redo stack (by undoing a prior
 *   dispatch) and clicks the Redo button, PlayPage fires a
 *   `track("play.redo", { gameId })` analytics breadcrumb (PlayPage.tsx
 *   line ~1296). That breadcrumb is the only signal in the local event
 *   ring that distinguishes a redo from any other state-restoring path,
 *   so a regression that drops it (e.g. a refactor that splits the
 *   undo/redo handlers and forgets to rewire the track call on the redo
 *   side) would silently delete a useful diagnostic without breaking the
 *   visible UI.
 *
 *   PlayPage.redoButton.test.tsx already covers the state-restoration
 *   side (visible counter flips, button enable/disable). It does NOT
 *   inspect the analytics ring, so the `track` side-effect of the redo
 *   handler has been an untested edge.
 *
 * Strategy:
 *   - Reuse the same `vi.hoisted` counter fixture pattern as
 *     PlayPage.redoButton.test.tsx so a single dispatch + undo + redo
 *     drives the redo handler exactly once. The reducer must return a
 *     fresh object on every "inc" so PlayPage's `next !== s` guard
 *     pushes an undo frame; returning the same reference would silently
 *     drop the frame and the test would race.
 *   - Use the analytics module's public `getEvents()` / `clearEvents()`
 *     helpers (instead of mocking the module) so the assertion matches
 *     the published contract: callers reading the ring downstream see
 *     this event with the expected props.
 *   - Clear the ring immediately before the redo click so unrelated
 *     boot-time / start / inc-time breadcrumbs (`app.boot`,
 *     `route.change`, `game.start`, `play.undo`) don't conflate with
 *     the assertion.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted counter fixture. Mirrors PlayPage.redoButton.test.tsx so any
// future fixture-level change there is easy to mirror here. The reducer
// returns a *new* object on every "inc" so the undo ring buffer actually
// captures a frame.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "redo-track-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Redo Track Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the redo-track analytics test.",
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
// stray render path side-effect-free even though we never reach the win
// banner here.
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

describe("PlayPage redo-button analytics (W732)", () => {
  it("clicking play-redo-btn records a play.redo event with gameId", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    const { getEvents, clearEvents } = await import(
      "../platform/analytics.js"
    );

    // Start from a known-empty ring so we don't conflate boot-time
    // breadcrumbs with the click we're about to make.
    clearEvents();

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so the fixture's component mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Dispatch one "inc" to advance the counter and seed the undo ring,
    // then undo to park the post-dispatch frame on the redo stack.
    fireEvent.click(screen.getByTestId("fx-inc"));
    fireEvent.click(screen.getByTestId("play-undo-btn"));

    // Sanity: the redo button is enabled now that a frame is parked.
    const redoBtn = screen.getByTestId("play-redo-btn") as HTMLButtonElement;
    expect(redoBtn.disabled).toBe(false);

    // Clear the ring right before the redo click so the assertion below
    // is unambiguously about the redo handler — not the prior game.start
    // / play.undo breadcrumbs from earlier in this same test.
    clearEvents();

    fireEvent.click(redoBtn);

    // Filter to the event of interest so any future unrelated breadcrumb
    // the redo handler grows alongside this one doesn't false-positive
    // a regression here.
    const redoEvts = getEvents().filter((e) => e.name === "play.redo");
    expect(redoEvts.length).toBe(1);
    expect(redoEvts[0]?.props).toEqual({
      gameId: hoisted.TEST_GAME_ID,
    });
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
