/**
 * Pin test: the PlayPage friend-code copy button has NO `id` attribute.
 *
 * Why pin this?
 *   The friend-code button is rendered with semantic hooks only -- a
 *   `data-testid`, a `className`, and an `aria-label`. It deliberately
 *   does NOT carry an `id`, because the friend banner can be remounted
 *   multiple times in the same document tree (e.g. when a multiplayer
 *   plugin renders its own banner) and a static DOM `id` would create
 *   duplicate-id violations and break label-target invariants.
 *
 *   Existing PlayPage friend-code tests cover the rendered code shape,
 *   the className string, the click-to-copy track event, and the
 *   clipboard write. None of them assert that the element is `id`-free.
 *   That negative invariant is currently untested, so this test pins
 *   `el.hasAttribute("id") === false` as a tight guardrail against any
 *   future refactor that introduces a stray `id={...}` for styling or
 *   "scroll into view" anchoring.
 *
 * Strategy:
 *   - Reuse the hoisted multiplayer-capable fixture pattern that the
 *     sibling friend-code tests use so the registry mock resolves to
 *     a single deterministic plugin and the friend banner reliably
 *     mounts.
 *   - Enter the route with `?friend=1` so the friend-mode branch lights
 *     up and the copy button is in the tree.
 *   - Assert `hasAttribute("id") === false` directly, which is the
 *     narrowest possible expression of the invariant.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted multiplayer-capable fixture. Mirrors PlayPageFriendCodeClass.test.tsx
// so the registry mock resolves to a single multiplayer plugin and the
// `?friend=1` banner branch is exercised.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (friend-code no-id test)",
    category: "solitaire" as const,
    players: { min: 1, max: 2, multiplayer: true },
    description: "Friend-code no-id pin test fixture.",
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

describe("PlayPage friend-code button has no id attribute (W2050)", () => {
  it("does not carry a DOM `id` attribute", async () => {
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

    // Narrowest expression of the invariant: no `id` attribute at all.
    // A stray empty `id=""` would also flip this to true and fail loudly.
    expect(el.hasAttribute("id")).toBe(false);
  });
});

// Touch React so this file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
