/**
 * Unit test for the PlayPage header friend button `className` contract
 * (W1257 — analog of the other header-iconbar attribute pins).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2108) renders the friend button with
 *   `className="play-iconbtn play-friend-btn"`. The first token
 *   (`play-iconbtn`) is the shared header iconbar style hook that gives
 *   every header button its 32x32 chrome, hover ring, and dark-mode
 *   color tokens; the second token (`play-friend-btn`) is the
 *   button-specific selector used by friend-mode-only CSS overrides
 *   (e.g. the small "Friend" hint label that hides on narrow widths).
 *   Without `play-iconbtn` the button would lose its iconbar chrome and
 *   visually disconnect from its siblings; without `play-friend-btn`
 *   any friend-mode-specific styling would silently drop.
 *
 *   Sibling tests cover other facets of this same button:
 *     - PlayPage.headerFriendButton.test.tsx covers presence/aria-label
 *     - PlayPage.headerFriendTitle.test.tsx (W1182) pins `title=`
 *     - PlayPage.headerFriendTooltip.test.tsx (W968) pins `data-tooltip`
 *     - PlayPage.headerFriendKeyshortcuts.test.tsx (W972) pins absence
 *       of `aria-keyshortcuts`
 *     - PlayPage.friend.test.tsx covers click-to-copy share-URL flow
 *     - PlayPage.friendShareTrack.test.tsx (W797) covers analytics
 *   None of them assert on `className`. A regression that dropped
 *   `play-iconbtn` (chrome lost), dropped `play-friend-btn`
 *   (friend-specific overrides lost), or reordered the tokens with
 *   extra surrounding whitespace would slip past every existing test.
 *
 * Strategy mirrors the other single-attribute pins on this button —
 * single focused class-list assertion using `classList.contains` so the
 * test is order-insensitive and tolerates any benign whitespace.
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
  const TEST_GAME_ID = "header-friend-classname-fixture";
  type State = { seed: number };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Friend ClassName Fixture",
    category: "cards" as const,
    players: { min: 1, max: 2, multiplayer: true },
    description:
      "Test-only multiplayer plugin for the header friend className test.",
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

describe("PlayPage header friend button className contract (W1257)", () => {
  it("carries both 'play-iconbtn' (shared iconbar chrome hook) and 'play-friend-btn' (button-specific selector) on the play-friend-btn class list", async () => {
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

    // Both class tokens MUST be present. Asserting via classList keeps
    // the test order-insensitive and whitespace-tolerant — what we care
    // about is that BOTH styling hooks remain wired, not the literal
    // string layout.
    expect(btn.classList.contains("play-iconbtn")).toBe(true);
    expect(btn.classList.contains("play-friend-btn")).toBe(true);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
