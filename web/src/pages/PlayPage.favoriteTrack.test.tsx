/**
 * Unit test for the PlayPage favorite-toggle analytics breadcrumb (W736).
 *
 * Observable behavior:
 *   While the game is in the "playing" phase, pressing the unmodified `F`
 *   key flips the active game's favorite flag in userdata and fires a
 *   `track("play.favorite", { gameId, favorited })` analytics breadcrumb
 *   (PlayPage.tsx ~line 1591). That breadcrumb is the only signal in the
 *   local event ring that distinguishes a hotkey-driven favorite toggle
 *   from a lobby tile click, so a regression that drops it (e.g. a
 *   refactor that splits the keyboard shortcut handler and forgets to
 *   rewire the track call) would silently delete a useful diagnostic
 *   without breaking the visible UI.
 *
 *   Sibling PlayPage tests cover other tracked events (`play.hint`,
 *   `play.undo`, `play.redo`, `play.replay_saved`, `friend.copy_code`)
 *   but none exercise the favorite hotkey path, so this analytics
 *   side-effect has been an untested edge.
 *
 * Strategy:
 *   - Mock the registry with a minimal one-game fixture so PlayPage
 *     mounts without dragging real reducers / win conditions in.
 *   - Use the analytics module's public `getEvents()` / `clearEvents()`
 *     helpers (instead of mocking the module) so the assertion matches
 *     the published contract: callers reading the ring downstream see
 *     this event with the expected props.
 *   - Clear the ring immediately before the keypress so unrelated
 *     boot-time / start breadcrumbs (`app.boot`, `route.change`,
 *     `game.start`) don't conflate with the assertion.
 *   - Dispatch the F key on `window` (the handler attaches to window),
 *     not on a specific element, so we exercise the same path real users
 *     hit when no input is focused.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted minimal fixture plugin. Mirrors the pattern in
// PlayPage.redoTrack.test.tsx so future fixture-level changes there can
// be mirrored here easily.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "favorite-track-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Favorite Track Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the favorite-track analytics test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
    isTerminal: () => null,
    component: ({ state }: { state: State }) => (
      <div>
        <span data-testid="fx-count">{state.count}</span>
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

describe("PlayPage favorite-hotkey analytics (W736)", () => {
  it("pressing F while playing records a play.favorite event with gameId and favorited=true", async () => {
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

    // Move past the setup screen so phase === "playing" and the
    // window-level keydown handler that owns the F binding is mounted.
    fireEvent.click(screen.getByTestId("start-game"));

    // Clear the ring right before the keypress so the assertion below
    // is unambiguously about the favorite handler — not the prior
    // app.boot / route.change / game.start breadcrumbs from earlier in
    // this same test.
    clearEvents();

    // The handler is attached to `window`, not any specific element.
    // localStorage starts empty (favorites unset), so toggling once
    // adds the game and the breadcrumb's `favorited` payload should be
    // true.
    fireEvent.keyDown(window, { key: "f" });

    // Filter to the event of interest so any future unrelated breadcrumb
    // the favorite handler grows alongside this one doesn't false-positive
    // a regression here.
    const favEvts = getEvents().filter((e) => e.name === "play.favorite");
    expect(favEvts.length).toBe(1);
    expect(favEvts[0]?.props).toEqual({
      gameId: hoisted.TEST_GAME_ID,
      favorited: true,
    });
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
