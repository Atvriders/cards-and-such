/**
 * Unit test for the friend banner's share-link analytics breadcrumb (W797).
 *
 * Observable behavior:
 *   When a user clicks the `play-friend-btn` button, PlayPage copies a
 *   seeded share URL to the clipboard and fires a
 *   `track("friend.share", { gameId, copied })` analytics breadcrumb.
 *   That breadcrumb is the only signal the local event-log panel
 *   surfaces for the share-link flow (the sibling `friend.copy_code`
 *   event covers a different button -- the 6-character code copy --
 *   not this URL share). A regression that drops the track call (e.g.
 *   a refactor that moves the share handler but forgets the analytics
 *   side-effect) would silently delete a useful diagnostic without
 *   breaking the visible UI.
 *
 *   PlayPage.friend.test.tsx already covers the friend-share flow's
 *   visible behavior (URL shape, toast, friend-sessions bump). None of
 *   those tests inspect the analytics ring, so the `track` side-effect
 *   has been an untested edge of the click handler -- W797 in the
 *   audit's untested-events list.
 *
 * Strategy:
 *   - Reuse the same `vi.hoisted` multiplayer fixture pattern as the
 *     sibling friend-code track test so the registry mock resolves a
 *     single deterministic plugin and the friend button renders.
 *   - Stub `navigator.clipboard.writeText` so the click handler
 *     resolves cleanly with `copied: true` -- the clipboard contract
 *     itself is owned by PlayPage.friend.test.tsx.
 *   - After clicking, read the analytics ring via the module's public
 *     `getEvents()` API and assert exactly one `friend.share` event
 *     exists, with `props.gameId` matching the active plugin id and
 *     `props.copied` reflecting the (mocked) clipboard outcome.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted multiplayer-capable fixture. The friend share button only
// renders for plugins flagged `players.multiplayer: true`, so the
// fixture mirrors that exactly.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (friend-share track test)",
    category: "solitaire" as const,
    players: { min: 1, max: 2, multiplayer: true },
    description: "Friend-share analytics breadcrumb test fixture.",
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

// Stable seed so the share URL is deterministic if a future failure
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

describe("PlayPage friend share-link analytics (W797)", () => {
  it("clicking play-friend-btn records a friend.share event with the gameId", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    const { getEvents, clearEvents } = await import(
      "../platform/analytics.js"
    );

    // Start from a known-empty ring so we don't conflate boot-time
    // breadcrumbs (e.g. `app.boot`, `route.change`) with the click we're
    // about to make.
    clearEvents();

    // jsdom's navigator.clipboard is non-writable by default; the
    // defineProperty dance mirrors PlayPage.friendCodeCopy.test.tsx.
    // We resolve writeText cleanly so the handler reaches the
    // `copied = true` branch.
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn(async (_text: string) => {}) },
    });

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=${FIXED_SEED}`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    // Advance to the playing phase so the friend button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // The render+start-game path itself fires unrelated breadcrumbs
    // (game.start, etc). Clear once more right before the click so the
    // assertion below is unambiguously about the click handler.
    clearEvents();

    const button = screen.getByTestId("play-friend-btn");
    await act(async () => {
      fireEvent.click(button);
    });

    // Filter to the event of interest so any future unrelated
    // breadcrumb the click handler grows alongside this one doesn't
    // false-positive a regression here.
    const shareEvents = getEvents().filter((e) => e.name === "friend.share");
    expect(shareEvents.length).toBe(1);
    expect(shareEvents[0]?.props).toEqual({
      gameId: hoisted.TEST_GAME_ID,
      copied: true,
    });
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
