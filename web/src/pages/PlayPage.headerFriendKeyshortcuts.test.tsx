/**
 * Unit test for the PlayPage header friend button a11y contract (W972).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2106) renders a `<button data-testid="play-friend-btn">`
 *   in the header iconbar whenever (a) `phase === "playing"` and (b) the
 *   active plugin's `players.multiplayer` is true. The button intentionally
 *   has NO `aria-keyshortcuts` attribute -- there is no global keyboard
 *   shortcut bound to "share friend link", so advertising one to assistive
 *   tech would be a lie that screen-reader users would chase in vain.
 *
 *   W967 (PlayPage.headerFriendButton.test.tsx) pins the static UI
 *   attributes (tagName, type, aria-label), and W797
 *   (PlayPage.friendShareTrack.test.tsx) covers the click -> friend.share
 *   breadcrumb. Neither would catch a regression that *added* an
 *   `aria-keyshortcuts="..."` attribute (e.g. someone copy-pasting the
 *   help button's "F1" shortcut hint onto the friend button by accident).
 *   This test pins the absence-of-shortcut contract explicitly.
 *
 * Strategy mirrors PlayPage.headerFriendButton.test.tsx (W967):
 *   - Hoisted minimal fixture plugin with `players.multiplayer: true` so
 *     the iconbar branch (`plugin.players.multiplayer`) resolves true.
 *   - Mount at `/play/:gameId`, click start-game to enter playing phase.
 *   - Locate the button via its testid.
 *   - Assert `getAttribute("aria-keyshortcuts")` returns null (i.e. the
 *     attribute is *absent*, not just empty-string).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted multiplayer-capable fixture. The friend button only renders
// for plugins flagged `players.multiplayer: true`, so the fixture
// mirrors that exactly. (Per the W797 finding: gating is on
// `plugin.players.multiplayer`.)
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-friend-keyshortcuts-fixture";
  type State = { seed: number };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Friend Keyshortcuts Fixture",
    category: "cards" as const,
    players: { min: 1, max: 2, multiplayer: true },
    description: "Test-only plugin for the header friend-button keyshortcuts test.",
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

describe("PlayPage header friend button has no aria-keyshortcuts (W972)", () => {
  it("does not advertise any aria-keyshortcuts on play-friend-btn", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Friend button only mounts in the playing phase, so advance past
    // the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-friend-btn");

    // No keyboard shortcut is bound to "share friend link", so the
    // button must NOT carry aria-keyshortcuts. getAttribute returns
    // null when the attribute is entirely absent (vs. "" if present
    // but empty), so a strict null assertion catches both drift modes.
    expect(btn.getAttribute("aria-keyshortcuts")).toBeNull();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
