/**
 * Unit test for the PlayPage fullscreen-toggle analytics breadcrumb — exit
 * branch (W799).
 *
 * Observable behavior:
 *   When the toolbar's fullscreen button (`play-fullscreen-btn`) is clicked
 *   while `document.fullscreenElement` is non-null, `toggleFullscreen`
 *   (PlayPage.tsx ~line 617) takes the *exit* branch: it calls
 *   `document.exitFullscreen()` and fires
 *   `track("play.fullscreen", { gameId, exit: true })`. The sibling W794
 *   test only covers the enter branch (`exit: false`); a regression that
 *   silently drops the exit-branch breadcrumb (e.g. moving the track call
 *   inside the try/catch by accident, or dropping the `{ exit: true }`
 *   prop) would be invisible to W794. This test fills that gap.
 *
 * Strategy:
 *   - Reuse the W794 hoisted fixture plugin layout so the page renders
 *     without dragging the real game catalogue into the test.
 *   - Stub `HTMLElement.prototype.requestFullscreen` so the enter path is
 *     well-formed if anything else in the suite reaches it; this test
 *     never enters via that API. Stub `document.exitFullscreen` so the
 *     exit branch's `void docAny.exitFullscreen()` resolves cleanly
 *     without an unhandled rejection.
 *   - Override `document.fullscreenElement` via `Object.defineProperty`
 *     to return a non-null sentinel — this is what steers
 *     `toggleFullscreen` into the exit branch (PlayPage.tsx ~line 621).
 *     jsdom defines the property as a getter on `Document.prototype`, so
 *     a plain assignment is silently ignored; we redefine it with an
 *     explicit getter on the document instance.
 *   - Use the analytics module's public `getEvents()` / `clearEvents()`
 *     helpers (instead of mocking the module) so the assertion matches
 *     the published contract: callers reading the ring downstream see
 *     this event with the expected props.
 *   - Clear the ring immediately before the click so the assertion below
 *     is unambiguously about the fullscreen handler — not the prior
 *     `app.boot` / `route.change` / `game.start` breadcrumbs.
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
  const TEST_GAME_ID = "fullscreen-exit-track-fixture";
  type State = Record<string, never>;
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Fullscreen Exit Track Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the play.fullscreen exit-branch test.",
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

// Saved descriptor for `document.fullscreenElement` so we can restore the
// original (jsdom-supplied) getter after the test. Avoids leaking a
// permanent non-null fullscreen state into sibling tests run in the same
// worker.
let originalFullscreenElementDescriptor: PropertyDescriptor | undefined;

beforeEach(() => {
  localStorage.clear();
  originalFullscreenElementDescriptor = Object.getOwnPropertyDescriptor(
    Document.prototype,
    "fullscreenElement",
  );
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
  // Clean up direct prototype assignments — `restoreAllMocks` only resets
  // `vi.spyOn` targets, not properties we wrote ourselves.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (HTMLElement.prototype as any).requestFullscreen;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (document as any).exitFullscreen;
  // Restore the original `fullscreenElement` getter so sibling tests see
  // the stock jsdom behavior (returns null).
  if (originalFullscreenElementDescriptor) {
    Object.defineProperty(
      Document.prototype,
      "fullscreenElement",
      originalFullscreenElementDescriptor,
    );
  }
});

describe("PlayPage fullscreen analytics — exit branch (W799)", () => {
  it("clicking play-fullscreen-btn while fullscreen records exactly one play.fullscreen event with gameId and exit:true", async () => {
    // Stub requestFullscreen for symmetry / to avoid surprises if anything
    // in the render path probes it. The exit branch never calls this, so
    // the assertions below don't depend on it.
    const reqFs = vi.fn().mockResolvedValue(undefined);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (HTMLElement.prototype as any).requestFullscreen = reqFs;

    // Stub `document.exitFullscreen` so `void docAny.exitFullscreen()` in
    // the exit branch resolves cleanly. jsdom doesn't implement this, so
    // without the stub the `typeof docAny.exitFullscreen === "function"`
    // guard would skip the call entirely (the track() call still fires,
    // but the test would be less faithful to a real exit).
    const exitFs = vi.fn().mockResolvedValue(undefined);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document as any).exitFullscreen = exitFs;

    // Steer `toggleFullscreen` into the exit branch by making
    // `document.fullscreenElement` non-null. jsdom defines this as a
    // getter on `Document.prototype`, so a plain assignment is silently
    // ignored; redefine the property with an explicit getter that
    // returns a sentinel HTMLElement. The actual identity of the element
    // doesn't matter — the toggle only checks truthiness.
    const sentinel = document.createElement("div");
    Object.defineProperty(Document.prototype, "fullscreenElement", {
      configurable: true,
      get: () => sentinel,
    });

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
    // unambiguously about the fullscreen handler — not the prior
    // app.boot / route.change / game.start breadcrumbs from earlier in
    // this same test.
    clearEvents();

    act(() => {
      fireEvent.click(fsBtn);
    });

    // Filter to the event of interest so any future unrelated breadcrumb
    // the fullscreen handler grows alongside this one doesn't
    // false-positive a regression here.
    const fsEvts = getEvents().filter((e) => e.name === "play.fullscreen");
    expect(fsEvts.length).toBe(1);
    expect(fsEvts[0]?.props).toEqual({
      gameId: hoisted.TEST_GAME_ID,
      exit: true,
    });

    // Sanity-check that the click actually reached the exit API too —
    // a regression that flipped the conditional but kept the breadcrumb
    // would otherwise pass the prop assertion above. The enter path
    // must NOT have been reached.
    expect(exitFs).toHaveBeenCalledTimes(1);
    expect(reqFs).not.toHaveBeenCalled();
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
