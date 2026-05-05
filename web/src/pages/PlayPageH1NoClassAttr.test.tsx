/**
 * W2093 — focused coverage of the PlayPage page-title h1's lack of a
 * `class` HTML attribute.
 *
 * PlayPage.tsx (~line 1673) renders the loaded plugin's title as
 *   `<h1>{plugin.title}</h1>`
 * inside `.play-header-titlerow`. The element is intentionally a *bare*
 * `<h1>` — no `id`, no class attribute at all, no aria attributes. CSS
 * targets the heading via descendant selectors
 * (`.play-header-titleblock h1`, etc.), not via a class on the element
 * itself. Adding *any* class attribute to the h1 — even an empty
 * `class=""` — would silently couple external stylesheets, snapshot
 * expectations, and analytics hooks to that attribute, turning the bare
 * heading into a named selector target.
 *
 * Existing sibling coverage:
 *   - PlayPageH1Class.test.tsx (W2007) pins `h1.className === ""` (the
 *     DOM property is the empty string). That assertion passes BOTH for
 *     `<h1>` (no attribute at all) AND for `<h1 class="">` (attribute
 *     present with an empty value), because `Element.className` returns
 *     `""` in either case. It cannot detect the regression where someone
 *     adds `className=""` (or React renders `class=""` for any other
 *     reason) to the heading.
 *   - PlayPageH1NoId.test.tsx (W2004) pins `hasAttribute("id") === false`
 *     for the same h1 — the attribute-presence analogue for the id slot,
 *     but says nothing about class.
 *   - PlayPageH1Tag.test.tsx (W1951) pins `tagName === "H1"`.
 *   - PlayPage.headerTitle.test.tsx (W896) asserts only the textContent.
 *   - PlayPageHeaderTitleblockAttr.test.tsx pins the parent div's class,
 *     not the h1's.
 *
 * A regression that added `className=""` to the heading would slip past
 * the W2007 className-equality test (still `""`) but is a meaningfully
 * different DOM shape — `hasAttribute("class")` would flip from false to
 * true, and CSS attribute selectors like `h1[class]` would suddenly
 * match. Pin the attribute-presence fact directly via
 * `hasAttribute("class")`, which checks DOM attribute presence
 * regardless of value (including the empty string).
 *
 * Strategy mirrors PlayPageH1NoId.test.tsx (hoisted-fixture pattern):
 *   - vi.hoisted fixture plugin so the vi.mock factory captures it.
 *   - Confetti null-stub avoids canvas APIs jsdom does not ship.
 *   - Mount at `/play/:gameId` — the header h1 renders in any phase, no
 *     need to click `start-game`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "h1-no-class-attr-fixture";
  const TEST_TITLE = "H1 No-Class-Attr Fixture Game";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Sentinel description for the W2093 h1 no-class-attr test.",
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

describe("PlayPage h1 has no class attribute (W2093)", () => {
  it("renders the page-title <h1> without a `class` HTML attribute", async () => {
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
    // Pin attribute-presence directly. A regression that added any
    // `className=""` (or any other class value) to the heading would
    // flip this from false to true — even though the W2007 sibling test
    // (h1.className === "") would still pass for `class=""`.
    expect(h1!.hasAttribute("class") === false).toBe(true);
  });
});

void React;
