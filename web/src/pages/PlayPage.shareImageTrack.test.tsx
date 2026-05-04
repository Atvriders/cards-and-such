/**
 * Unit test for the PlayPage share-image analytics breadcrumb (W796).
 *
 * Observable behavior:
 *   When the win banner's "Save image" button (`play-share-image-btn`) is
 *   clicked while the page is in the terminal `ended` phase, the
 *   `shareImage` callback (PlayPage.tsx ~line 1451) builds a 1200×630 share
 *   card via `buildShareCardSvg`, hands it to `downloadSvg`, *and* fires a
 *   `track("play.share_image", { gameId })` analytics breadcrumb. The
 *   breadcrumb is the only signal in the local event ring that the user
 *   actually saved a share card (vs. tweeting / copying a link / printing
 *   from the same share row), so a regression that drops it — for instance,
 *   a refactor that swaps the SVG export for a PNG one and forgets to
 *   rewire the track call — would silently delete a useful diagnostic
 *   without breaking the visible UI.
 *
 *   Sibling PlayPage tests cover other tracked events (`play.print` (W778),
 *   `play.replay_saved` (W729), `play.redo` (W732), `play.favorite` (W736),
 *   `friend.copy_code` (W714), `game.win` (W787)) and
 *   `PlayPage.shareImage.test.tsx` (W192) already asserts the SVG payload
 *   reaches the download path, but no test exercises the analytics
 *   side-effect of that click. This test fills that gap.
 *
 * Strategy:
 *   - Mirror the win-banner fixture pattern from `PlayPage.shareImage.test`
 *     and `PlayPage.printTrack.test` (a hoisted plugin with a `WIN`-action
 *     reducer + positive `isTerminal` score) so the page reaches
 *     `phase === "ended"` deterministically and the share row containing
 *     `play-share-image-btn` renders.
 *   - Stub `URL.createObjectURL` / `URL.revokeObjectURL` (jsdom doesn't
 *     implement them) and the anchor `click()` so the `downloadSvg` call
 *     inside `shareImage` runs cleanly and reaches the subsequent
 *     `track("play.share_image", ...)` line.
 *   - Use the analytics module's public `getEvents()` / `clearEvents()`
 *     helpers (instead of mocking the module) so the assertion matches the
 *     published contract: callers reading the ring downstream see this
 *     event with the expected props.
 *   - Clear the ring immediately before the click so the assertion below
 *     is unambiguously about the share-image handler — not the prior
 *     `app.boot` / `route.change` / `game.start` / `game.win` breadcrumbs
 *     from earlier in this same test.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin. Minimal reducer/isTerminal pair that flips into
// a winning terminal state on a single dispatched action — enough to drive
// PlayPage to `phase === "ended"` with `finalScore > 0`, which reveals the
// share row containing the share-image button under test.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "share-image-track-fixture";
  type State = { won: boolean };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Share Image Track Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the share-image-track analytics test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ won: false }),
    reducer: (s: State, action: { type: string }): State =>
      action?.type === "WIN" ? { won: true } : s,
    isTerminal: (s: State) => (s.won ? { score: 1 } : null),
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
  return { TEST_GAME_ID, fixturePlugin };
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

describe("PlayPage share-image analytics (W796)", () => {
  it("clicking play-share-image-btn on the win banner records exactly one play.share_image event with gameId", async () => {
    // jsdom doesn't implement URL.createObjectURL/revokeObjectURL — stub
    // them so the `downloadSvg` call inside `shareImage` runs without
    // throwing and the subsequent `track("play.share_image", ...)` line
    // is reached.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (URL as any).createObjectURL = vi.fn(() => "blob:share-image-track-mock");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (URL as any).revokeObjectURL = vi.fn();
    // The anchor click would otherwise try to navigate to the blob URL.
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

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

    // Move past the setup screen, then dispatch the win action so the
    // page transitions into `phase === "ended"` and the win-banner share
    // row (with `play-share-image-btn`) mounts.
    fireEvent.click(screen.getByTestId("start-game"));
    act(() => {
      fireEvent.click(screen.getByTestId("fixture-win"));
    });

    const shareBtn = screen.getByTestId("play-share-image-btn");
    expect(shareBtn).toBeTruthy();

    // Clear the ring right before the click so the assertion below is
    // unambiguously about the share-image handler — not the prior
    // app.boot / route.change / game.start / game.win breadcrumbs from
    // earlier in this same test.
    clearEvents();

    act(() => {
      fireEvent.click(shareBtn);
    });

    // Filter to the event of interest so any future unrelated breadcrumb
    // the share-image handler grows alongside this one doesn't false-
    // positive a regression here.
    const shareEvts = getEvents().filter(
      (e) => e.name === "play.share_image",
    );
    expect(shareEvts.length).toBe(1);
    expect(shareEvts[0]?.props).toEqual({
      gameId: hoisted.TEST_GAME_ID,
    });

    clickSpy.mockRestore();
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
