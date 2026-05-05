/**
 * W2007 — focused coverage of the PlayPage page-title h1's exact
 * `className` value.
 *
 * PlayPage.tsx (~line 1673) renders the loaded plugin's title as
 *   `<h1>{plugin.title}</h1>`
 * inside `.play-header-titlerow`. The element is intentionally a *bare*
 * `<h1>` with no class attribute — its DOM `className` property is the
 * empty string. CSS targets the heading via descendant selectors
 * (`.play-header-titleblock h1`, etc.), not via a class on the element
 * itself. Adding any class to the h1 would silently couple external
 * stylesheets, snapshot expectations, and analytics hooks to that
 * class, turning the bare heading into a named selector target.
 *
 * Existing sibling coverage:
 *   - PlayPageH1Tag.test.tsx (W1951) pins `tagName === "H1"` via a raw
 *     `document.querySelector("h1")` lookup but never reads className.
 *   - PlayPageH1NoId.test.tsx (W2004) pins the absence of an `id`
 *     attribute on the same element but says nothing about class.
 *   - PlayPage.headerTitle.test.tsx (W896) asserts the textContent of
 *     the h1 but not its className.
 *   - PlayPageHeaderTitleblockAttr.test.tsx pins the parent div's
 *     `className === "play-header-titleblock"`, not the h1's.
 *   - PlayPageHeaderChildCount.test.tsx counts header children, not
 *     class attributes.
 *
 * A regression that added `className="play-title"` (or any other
 * class) to the heading — for instance, to wire up a CSS rule, a
 * snapshot hook, or a layout modifier — would slip past every
 * existing PlayPage test. Pin the exact-equality fact via a raw
 * `document.querySelector("h1")` lookup and `className === ""`,
 * which directly compares the DOMTokenList-backed className string.
 *
 * Strategy mirrors PlayPageH1NoId.test.tsx (hoisted-fixture pattern):
 *   - vi.hoisted fixture plugin so the vi.mock factory captures it.
 *   - Confetti null-stub avoids canvas APIs jsdom does not ship.
 *   - Mount at `/play/:gameId` — the header h1 renders in any phase,
 *     no need to click `start-game`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "h1-class-fixture";
  const TEST_TITLE = "H1 Class Fixture Game";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Sentinel description for the W2007 h1 className test.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, TEST_TITLE, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

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

describe("PlayPage h1 className exact equality (W2007)", () => {
  it("renders the page-title <h1> with className exactly the empty string", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const h1 = document.querySelector("h1");
    expect(h1).not.toBeNull();
    // Pin the exact className string. A regression that added any
    // class token (e.g. `className="play-title"`) would flip this
    // from "" to a non-empty token list and fail the assertion.
    expect(h1!.className === "").toBe(true);
  });
});

void React;
