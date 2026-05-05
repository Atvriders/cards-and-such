/**
 * Pin test: the PlayPage friend-code copy button has NO `tabindex` attribute.
 *
 * Why pin this?
 *   The friend-code button is a native `<button>` element, which is
 *   keyboard-focusable by default. The component deliberately does NOT
 *   set a `tabindex` attribute -- not `tabIndex={0}` (redundant), not
 *   `tabIndex={-1}` (would remove it from sequential keyboard nav and
 *   make the copy affordance keyboard-inaccessible), and not any other
 *   value that would override the document's natural tab order.
 *
 *   Existing PlayPage friend-code tests cover the rendered code shape,
 *   the className string, the absence of an `id`, the absence of inline
 *   `style`, the click-to-copy track event, and the clipboard write.
 *   None of them assert that the element is `tabindex`-free. That
 *   negative invariant is currently untested, so this test pins
 *   `el.hasAttribute("tabindex") === false` as a tight guardrail
 *   against any future refactor that introduces a stray `tabIndex={...}`
 *   for focus-management experiments.
 *
 * Strategy:
 *   - Reuse the hoisted multiplayer-capable fixture pattern that the
 *     sibling friend-code tests use so the registry mock resolves to a
 *     single deterministic plugin and the friend banner reliably mounts.
 *   - Enter the route with `?friend=1` so the friend-mode branch lights
 *     up and the copy button is in the tree.
 *   - Assert `hasAttribute("tabindex") === false` directly, which is the
 *     narrowest possible expression of the invariant.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted multiplayer-capable fixture. Mirrors PlayPageFriendCodeNoId.test.tsx
// so the registry mock resolves to a single multiplayer plugin and the
// `?friend=1` banner branch is exercised.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (friend-code no-tabindex test)",
    category: "solitaire" as const,
    players: { min: 1, max: 2, multiplayer: true },
    description: "Friend-code no-tabindex pin test fixture.",
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

describe("PlayPage friend-code button has no tabindex attribute (W2292)", () => {
  it("does not carry a DOM `tabindex` attribute", async () => {
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

    // Narrowest expression of the invariant: no `tabindex` attribute at
    // all. Native <button> is already keyboard-focusable, so any explicit
    // tabindex (even `0`) would be a refactor signal worth catching.
    expect(el.hasAttribute("tabindex")).toBe(false);
  });
});

// Touch React so this file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
