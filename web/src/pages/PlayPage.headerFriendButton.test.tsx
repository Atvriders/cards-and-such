/**
 * Unit test for the PlayPage header friend button UI contract (W967).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2106) renders a `<button data-testid="play-friend-btn">`
 *   in the header iconbar whenever (a) `phase === "playing"` and (b) the
 *   active plugin's `players.multiplayer` is true. It is a `type="button"`
 *   (so a stray wrapping form can never submit), it carries an aria-label
 *   of "Play with a friend" (announcing intent to screen readers), a
 *   matching `data-tooltip`, and shows a visible "people" SVG glyph plus
 *   a small "Friend" hint label.
 *
 *   W797 (PlayPage.friendShareTrack.test.tsx) covers the click ->
 *   friend.share analytics breadcrumb, and PlayPage.friend.test.tsx
 *   covers the share-URL flow's visible behavior, but no test pins the
 *   button's *static UI attributes* -- a regression that swapped the
 *   aria-label for "Friend" (drift) or set `type="submit"` (form-bug)
 *   would slip past every existing test.
 *
 * Strategy mirrors PlayPage.headerHelpButton.test.tsx (W914),
 * PlayPage.headerInfoButton.test.tsx (W900), and
 * PlayPage.headerSettingsButton.test.tsx (W906):
 *   - Hoisted minimal fixture plugin with `players.multiplayer: true` so
 *     the iconbar branch (`plugin.players.multiplayer`) resolves true.
 *   - Mount at `/play/:gameId`, click start-game to enter playing phase.
 *   - Locate the button via its testid.
 *   - Pin three static attributes:
 *       1. tagName === BUTTON  (not <a>, not <div role="button">).
 *       2. type === "button"   (so a future form wrapper can't submit).
 *       3. aria-label === "Play with a friend" (screen-reader contract).
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
  const TEST_GAME_ID = "header-friend-btn-fixture";
  type State = { seed: number };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Friend Button Fixture",
    category: "cards" as const,
    players: { min: 1, max: 2, multiplayer: true },
    description: "Test-only plugin for the header friend-button UI test.",
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

describe("PlayPage header friend button UI contract (W967)", () => {
  it("renders a <button type='button'> with the 'Play with a friend' a11y label", async () => {
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

    // Tag-name contract -- anchors and div-role-buttons would break
    // browser-native focus + Enter/Space activation.
    expect(btn.tagName).toBe("BUTTON");

    // Explicit type -- a missing or "submit" type would let a future
    // ancestor <form> swallow Enter and submit the page.
    expect(btn.getAttribute("type")).toBe("button");

    // Screen-reader contract -- the visible "Friend" hint label is
    // small chrome text; the aria-label is the authoritative,
    // unambiguous label exposed to assistive tech.
    expect(btn.getAttribute("aria-label")).toBe("Play with a friend");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
