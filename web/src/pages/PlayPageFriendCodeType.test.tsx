/**
 * Pin test: the PlayPage friend-code copy button has `type="button"`.
 *
 * Why pin this?
 *   The friend-code copy affordance lives inside a `<button>` element.
 *   Without an explicit `type` attribute, the HTML default for buttons
 *   nested inside a `<form>` is `submit`, which would cause unintended
 *   form submission if the friend banner ever ends up inside a form
 *   (e.g. a future settings drawer or share dialog). The component
 *   deliberately sets `type="button"` to make the element a plain
 *   action-trigger that fires its `onClick` without any form-submit
 *   side effects.
 *
 *   Existing PlayPage friend-code tests cover the rendered code shape,
 *   the className string, the absence of an `id`, the absence of inline
 *   `style`, the absence of `tabindex`, the click-to-copy track event,
 *   and the clipboard write. None of them assert the `type="button"`
 *   invariant. That positive invariant is currently untested, so this
 *   test pins `el.getAttribute("type") === "button"` as a tight
 *   guardrail against any future refactor that drops the explicit
 *   `type` (and silently regresses to `type="submit"` semantics).
 *
 * Strategy:
 *   - Reuse the hoisted multiplayer-capable fixture pattern that the
 *     sibling friend-code tests use so the registry mock resolves to a
 *     single deterministic plugin and the friend banner reliably mounts.
 *   - Enter the route with `?friend=1` so the friend-mode branch lights
 *     up and the copy button is in the tree.
 *   - Assert the rendered DOM `type` attribute is exactly `"button"`,
 *     which is the narrowest possible expression of the invariant.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted multiplayer-capable fixture. Mirrors PlayPageFriendCodeNoTabindex
// .test.tsx so the registry mock resolves to a single multiplayer plugin and
// the `?friend=1` banner branch is exercised.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (friend-code type test)",
    category: "solitaire" as const,
    players: { min: 1, max: 2, multiplayer: true },
    description: "Friend-code type pin test fixture.",
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

describe("PlayPage friend-code button has type='button' (W2349)", () => {
  it("renders with a DOM `type` attribute exactly equal to 'button'", async () => {
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

    // Narrowest expression of the invariant: the rendered DOM `type`
    // attribute is exactly `"button"`. This guards against the HTML
    // default of `type="submit"` for buttons nested inside a `<form>`.
    expect(el.getAttribute("type")).toBe("button");
  });
});

// Touch React so this file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
