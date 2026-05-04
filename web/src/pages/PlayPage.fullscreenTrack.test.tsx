/**
 * Unit test for the PlayPage fullscreen-toggle analytics breadcrumb (W794).
 *
 * Observable behavior:
 *   When the toolbar's fullscreen button (`play-fullscreen-btn`) is clicked
 *   while the page is in `phase === "playing"`, the `toggleFullscreen`
 *   callback (PlayPage.tsx ~line 617) invokes `el.requestFullscreen()` on
 *   the play-panel element *and* fires a `track("play.fullscreen", { gameId,
 *   exit })` analytics breadcrumb. The breadcrumb is the only signal in the
 *   local event ring that the user actually entered fullscreen (vs. e.g.
 *   opening the share row or clicking another toolbar button), so a
 *   regression that drops it — for instance, a refactor that moves the
 *   toggle into a higher-order helper and forgets to rewire the track call
 *   — would silently delete a useful diagnostic without breaking the
 *   visible UI.
 *
 *   Sibling PlayPage tests cover other tracked events (`play.hint`,
 *   `play.undo`, `play.redo`, `play.replay_saved`, `play.favorite`,
 *   `play.print`, `friend.copy_code`, `game.win`) and `analytics.test.ts`
 *   covers `game.start`, but no test exercises the `play.fullscreen`
 *   breadcrumb fired by the toolbar toggle. This test fills that gap.
 *
 * Strategy:
 *   - Use a hoisted minimal fixture plugin so the page renders without
 *     dragging the real game catalogue into the test, mirroring sibling
 *     `*Track*.test.tsx` files.
 *   - jsdom does not implement `Element.requestFullscreen`, so the
 *     `typeof el.requestFullscreen === "function"` guard in
 *     `toggleFullscreen` is otherwise false and the `track()` call is
 *     skipped entirely. Stub it on `HTMLElement.prototype` (the play panel
 *     is an `HTMLElement`) with a `vi.fn().mockResolvedValue(undefined)` so
 *     the guard passes and the request resolves cleanly.
 *   - Use the analytics module's public `getEvents()` / `clearEvents()`
 *     helpers (instead of mocking the module) so the assertion matches the
 *     published contract: callers reading the ring downstream see this
 *     event with the expected props.
 *   - Clear the ring immediately before the click so the assertion below is
 *     unambiguously about the fullscreen handler — not the prior `app.boot`
 *     / `route.change` / `game.start` breadcrumbs from earlier in this same
 *     test.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin. Minimal non-terminal reducer so the page sits in
// `phase === "playing"` after `start-game`, which is the only phase that
// renders the fullscreen toolbar button.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "fullscreen-track-fixture";
  type State = Record<string, never>;
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Fullscreen Track Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the play.fullscreen analytics test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({}),
    reducer: (s: State): State => s,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-body" />,
  };
  return { TEST_GAME_ID, fixturePlugin };
});

// PlayPage looks the plugin up via the games registry — substitute the
// fixture so we don't drag the real game catalogue into the test.
vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
  // Clean up the prototype stub so it doesn't leak into sibling tests run
  // in the same worker. `restoreAllMocks` only resets `vi.spyOn` targets;
  // direct assignments to a prototype property need explicit teardown.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (HTMLElement.prototype as any).requestFullscreen;
});

describe("PlayPage fullscreen analytics (W794)", () => {
  it("clicking play-fullscreen-btn records exactly one play.fullscreen event with gameId and exit:false", async () => {
    // jsdom doesn't implement Element.requestFullscreen — install a spy on
    // the prototype so the `typeof el.requestFullscreen === "function"`
    // guard in toggleFullscreen passes and the subsequent
    // `track("play.fullscreen", ...)` call is reached. Resolve the promise
    // so `void el.requestFullscreen()` doesn't surface as an unhandled
    // rejection in the test runner.
    const reqFs = vi.fn().mockResolvedValue(undefined);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (HTMLElement.prototype as any).requestFullscreen = reqFs;

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

    // Advance past the setup screen so phase === "playing" and the
    // fullscreen toolbar button mounts. The button is gated on
    // `phase === "playing"` (PlayPage.tsx ~line 2186).
    fireEvent.click(screen.getByTestId("start-game"));

    const fsBtn = screen.getByTestId("play-fullscreen-btn");
    expect(fsBtn).toBeTruthy();

    // Clear the ring right before the click so the assertion below is
    // unambiguously about the fullscreen handler — not the prior app.boot
    // / route.change / game.start breadcrumbs from earlier in this same
    // test.
    clearEvents();

    act(() => {
      fireEvent.click(fsBtn);
    });

    // Filter to the event of interest so any future unrelated breadcrumb
    // the fullscreen handler grows alongside this one doesn't false-positive
    // a regression here.
    const fsEvts = getEvents().filter((e) => e.name === "play.fullscreen");
    expect(fsEvts.length).toBe(1);
    expect(fsEvts[0]?.props).toEqual({
      gameId: hoisted.TEST_GAME_ID,
      exit: false,
    });

    // Sanity-check that the click reached requestFullscreen too — the
    // track call only fires from inside the same try block, so a missing
    // request call would point to a different regression than the
    // breadcrumb.
    expect(reqFs).toHaveBeenCalledTimes(1);
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
