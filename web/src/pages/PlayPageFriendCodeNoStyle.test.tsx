/**
 * Pin test: the PlayPage friend-code copy button has NO inline `style`
 * attribute on its rendered DOM node.
 *
 * Why pin this?
 *   The friend banner's code button (`button.play-friend-code`) takes
 *   all of its visual treatment -- pill chrome, padding, focus ring,
 *   typography -- from the page stylesheet. There is intentionally no
 *   inline `style` on the JSX. If a refactor adds an inline style (for
 *   example to nudge a margin or temporarily hard-code a color), it
 *   silently overrides the stylesheet rules and the button drifts out
 *   of the rest of the friend banner's design language.
 *
 *   Existing PlayPage friend-code tests cover the rendered code shape,
 *   the literal className, the click-to-copy track event, and the
 *   clipboard write. None of them assert that the element has no
 *   `style` attribute, so this surface is currently untested. Pinning
 *   the absence of `style` catches any future inline-style drift at
 *   the UI seam.
 *
 * Strategy:
 *   - Use the same hoisted multiplayer-capable fixture pattern as the
 *     other PlayPage friend tests so the registry mock resolves to a
 *     single deterministic plugin and the friend banner reliably
 *     renders.
 *   - Mount with `?friend=1` so the friend-mode branch lights up and
 *     the copy button is in the tree.
 *   - Assert `el.hasAttribute("style") === false` so any inline style
 *     -- even an empty `style=""` -- fails the test loudly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted multiplayer-capable fixture. Mirrors PlayPageFriendCodeClass so
// the registry mock resolves to a single multiplayer plugin and the
// `?friend=1` banner branch is exercised.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (friend-code no-style test)",
    category: "solitaire" as const,
    players: { min: 1, max: 2, multiplayer: true },
    description: "Friend-code no-inline-style pin test fixture.",
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

describe("PlayPage friend-code button has no inline style (W2153)", () => {
  it("does not have a `style` attribute on the rendered button", async () => {
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

    // Strict assertion: any inline style attribute -- even an empty
    // `style=""` injected by a refactor -- must fail this pin.
    expect(el.hasAttribute("style") === false).toBe(true);
  });
});

// Touch React so this file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
