/**
 * Pin test: the PlayPage friend-code copy button's `className` is
 * exactly the string `"play-friend-code"`.
 *
 * Why pin this?
 *   The friend banner's code button is the visual surface users tap to
 *   share a challenge. Its CSS hooks (`button.play-friend-code` in the
 *   page stylesheet) drive the inline pill chrome -- font, padding, and
 *   focus-ring contrast. If a refactor accidentally appends an extra
 *   utility class, drops the original, or starts merging classnames via
 *   a helper that injects whitespace, the styling silently drifts and
 *   the click target loses its affordance.
 *
 *   Existing PlayPage friend-code tests cover the rendered code shape,
 *   the click-to-copy track event, and the clipboard write. None of
 *   them assert exact `className` equality, so the class hook itself
 *   is currently untested. This test pins the literal string so any
 *   future class drift is caught at the UI seam.
 *
 * Strategy:
 *   - Use the same hoisted multiplayer-capable fixture pattern as the
 *     other PlayPage friend tests so the registry mock resolves to a
 *     single deterministic plugin and the friend banner reliably
 *     renders.
 *   - Mount with `?friend=1` so the friend-mode branch lights up and
 *     the copy button is in the tree.
 *   - Assert with strict `===` equality so any extra/missing class --
 *     even an empty trailing space -- fails the test loudly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted multiplayer-capable fixture. Mirrors PlayPage.friendCode.test.tsx
// so the registry mock resolves to a single multiplayer plugin and the
// `?friend=1` banner branch is exercised.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (friend-code class test)",
    category: "solitaire" as const,
    players: { min: 1, max: 2, multiplayer: true },
    description: "Friend-code className pin test fixture.",
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

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage friend-code button className (W1906)", () => {
  it("has className exactly equal to 'play-friend-code'", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[
          `/play/${hoisted.TEST_GAME_ID}?seed=42&friend=1`,
        ]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    const el = screen.getByTestId("play-friend-code");

    // Strict equality so any drift (added utility class, dropped class,
    // stray whitespace from a classname helper) fails this test.
    expect(el.className === "play-friend-code").toBe(true);
  });
});

// Touch React so this file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
