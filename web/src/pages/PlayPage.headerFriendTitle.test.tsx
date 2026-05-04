/**
 * Unit test for the PlayPage header friend button native `title=`
 * attribute contract (W1182 — analog of W1172 (fullscreen title) and the
 * other header-iconbar native-title tests).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2110) renders a `<button data-testid="play-friend-btn">`
 *   in the header iconbar whenever (a) `phase === "playing"` and (b) the
 *   active plugin is flagged `players.multiplayer: true`. The button
 *   carries a `title="Play with a friend (copies seeded link)"` attribute
 *   that the native browser hover-tooltip surfaces on long-hover for
 *   desktop pointer users — distinct from the trimmed
 *   `data-tooltip="Play with a friend"` (CSS hover layer) and the
 *   `aria-label="Play with a friend"` (screen-reader announcement). The
 *   parenthetical "(copies seeded link)" suffix is the disclosure that
 *   warns the click will copy a shareable URL to the clipboard.
 *
 *   Sibling tests cover other facets of this same button:
 *     - PlayPage.headerFriendTooltip.test.tsx (W968) pins `data-tooltip`
 *     - PlayPage.headerFriendButton.test.tsx covers presence/aria-label
 *     - PlayPage.headerFriendKeyshortcuts.test.tsx pins keyshortcuts
 *     - PlayPage.friend.test.tsx covers the click-to-copy share-URL flow
 *     - PlayPage.friendShareTrack.test.tsx (W797) covers the analytics
 *       breadcrumb fired on click
 *   None of them assert on the native `title=` attribute. A regression
 *   that dropped the parenthetical disclosure, swapped to the trimmed
 *   data-tooltip copy, or removed the attribute entirely (no native
 *   browser tooltip at all) would slip past every existing test on this
 *   button.
 *
 * Strategy mirrors W1172 (PlayPage.headerFullscreenTitle.test.tsx) —
 * single focused attribute pin via getAttribute("title") — but uses the
 * multiplayer-capable fixture pattern from W968/W797 because the friend
 * button only mounts when the active plugin advertises
 * `players.multiplayer: true`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted multiplayer-capable fixture — vi.hoisted runs before vi.mock
// factories evaluate. `players.multiplayer: true` is the gate that
// mounts the friend button; the rest of the plugin shape is the
// minimal viable surface PlayPage needs to advance past setup.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-friend-title-fixture";
  type State = { seed: number };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Friend Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 2, multiplayer: true },
    description:
      "Test-only multiplayer plugin for the header friend native-title test.",
    settings: {} as Record<string, never>,
    initialState: (seed: number): State => ({ seed }),
    reducer: (s: State): State => s,
    isTerminal: () => null,
    component: ({ state }: { state: State }) => (
      <div>
        <span data-testid="fx-seed">{state.seed}</span>
      </div>
    ),
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// render side-effect-free.
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

describe("PlayPage header friend button title contract (W1182)", () => {
  it("pins title='Play with a friend (copies seeded link)' so the native browser hover-tooltip surfaces the verbose disclosure copy", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Friend button only mounts in the playing phase, so advance past
    // the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-friend-btn") as HTMLButtonElement;

    // Native browser-tooltip contract — pin the literal verbose copy
    // including the "(copies seeded link)" disclosure. Drift to the
    // trimmed "Play with a friend" (data-tooltip copy), shortening to
    // "Friend", or dropping the attribute entirely (no native tooltip
    // at all) would slip past every sibling tooltip/keyshortcuts/aria
    // test on this button.
    expect(btn.getAttribute("title")).toBe(
      "Play with a friend (copies seeded link)",
    );
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
