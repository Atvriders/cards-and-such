/**
 * Unit test for the friend banner's copy-code analytics breadcrumb (W714).
 *
 * Observable behavior:
 *   When a user clicks the `play-friend-code` button, PlayPage fires a
 *   `track("friend.copy_code", { gameId })` analytics breadcrumb in
 *   addition to the clipboard write. That breadcrumb is the only signal
 *   the local event-log panel surfaces for the share-by-code flow, so a
 *   regression that drops it (e.g. a refactor that moves the copy
 *   handler but forgets the track call) would silently delete a useful
 *   diagnostic without breaking the visible UI.
 *
 *   The two sibling tests already cover (a) the 6-char shape of the code
 *   and (b) clipboard.writeText being called with the displayed text.
 *   Neither one inspects the analytics ring, so the `track` side-effect
 *   has been an untested edge of the click handler.
 *
 * Strategy:
 *   - Reuse the same `vi.hoisted` multiplayer fixture pattern as the
 *     other friend-code tests so the registry mock resolves a single
 *     deterministic plugin at dictionary slot 0. This keeps the encoder
 *     output stable and the banner's copy button guaranteed-rendered.
 *   - Stub `navigator.clipboard.writeText` so the click handler doesn't
 *     blow up on the missing jsdom clipboard. We don't assert on it here
 *     -- that contract is owned by PlayPage.friendCodeCopy.test.tsx.
 *   - After clicking, read the analytics ring via the module's public
 *     `getEvents()` API and assert exactly one `friend.copy_code` event
 *     exists, with `props.gameId` matching the active plugin id. Using
 *     `getEvents` (instead of e.g. peeking at the localStorage mirror
 *     or re-mocking the analytics module) keeps the test honest about
 *     the published contract: callers who read the ring downstream see
 *     this event.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted multiplayer-capable fixture. Same shape as the sibling
// friend-mode tests so the registry mock resolves to a single plugin at
// dictionary slot 0 -- guaranteeing the encoder produces a code and the
// banner renders the copy button.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (friend-code track test)",
    category: "solitaire" as const,
    players: { min: 1, max: 2, multiplayer: true },
    description: "Friend-code analytics breadcrumb test fixture.",
    settings: {} as Record<string, never>,
    initialState: (seed: number) => ({ seed }),
    reducer: (s: { seed: number }) => s,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Stable seed so the encoded code is deterministic if a future failure
// needs to be triaged from the test output.
const FIXED_SEED = 42;

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage friend banner copy-code analytics (W714)", () => {
  it("clicking play-friend-code records a friend.copy_code event with the gameId", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    const { getEvents, clearEvents } = await import(
      "../platform/analytics.js"
    );

    // Start from a known-empty ring so we don't conflate boot-time
    // breadcrumbs (e.g. `app.boot`, `route.change`) with the click we're
    // about to make. clearEvents touches both the in-memory ring and
    // the localStorage mirror -- exactly what we want pre-render.
    clearEvents();

    // jsdom's navigator.clipboard is non-writable by default; the
    // defineProperty dance mirrors PlayPage.friendCodeCopy.test.tsx.
    // We provide a no-op writeText so the click handler resolves
    // cleanly -- the clipboard contract is owned by the sibling test.
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn(async (_text: string) => {}) },
    });

    render(
      <MemoryRouter
        initialEntries={[
          `/play/${hoisted.TEST_GAME_ID}?seed=${FIXED_SEED}&friend=1`,
        ]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    // The render+start-game path itself can fire unrelated breadcrumbs
    // (game.start, etc). Clear once more right before the click so the
    // assertion below is unambiguously about the click handler.
    clearEvents();

    const button = screen.getByTestId("play-friend-code");
    await act(async () => {
      fireEvent.click(button);
    });

    // Filter to the event of interest so any future unrelated
    // breadcrumb the click handler grows alongside this one (e.g.
    // `friend.copy_success`) doesn't false-positive a regression here.
    const copyEvents = getEvents().filter(
      (e) => e.name === "friend.copy_code",
    );
    expect(copyEvents.length).toBe(1);
    expect(copyEvents[0]?.props).toEqual({ gameId: hoisted.TEST_GAME_ID });
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
