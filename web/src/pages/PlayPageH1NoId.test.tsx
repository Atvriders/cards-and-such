/**
 * W2004 — focused coverage of the PlayPage page-title h1's lack of an
 * `id` HTML attribute.
 *
 * PlayPage.tsx (~line 1673) renders the loaded plugin's title as
 *   `<h1>{plugin.title}</h1>`
 * inside `.play-header-titlerow`. The element is intentionally a *bare*
 * `<h1>` — no `id`, no class, no aria attributes. The page title is the
 * primary document heading; assigning it an `id` would silently couple
 * external selectors (anchor fragments, ARIA labelledby/describedby,
 * CSS, analytics hooks) to the element and turn the heading into an
 * anchor target it was never designed to be.
 *
 * Existing sibling coverage:
 *   - PlayPageH1Tag.test.tsx (W1951) pins `tagName === "H1"` via a raw
 *     `document.querySelector("h1")` lookup but does not look at the
 *     element's attributes.
 *   - PlayPage.headerTitle.test.tsx (W896) asserts the textContent of
 *     the h1 inside `.play-header-titlerow` but does not check id.
 *   - PlayPageHeaderTitleblockAttr.test.tsx and PlayPageHeaderChildCount
 *     pin parent header structure, not the h1 attributes.
 *   - PlayPageSeedPickerInputId pins an `id` on a different element
 *     (the seed input), not the h1.
 *
 * A regression that added `id="play-title"` (or any other id) to the
 * heading — for instance, to wire up a `aria-labelledby`, an in-page
 * skip-link target, or a CSS `#play-title` selector — would slip past
 * every existing PlayPage test. Pin the negative attribute fact via a
 * raw `document.querySelector("h1")` lookup and `hasAttribute("id")`,
 * which directly checks the DOM attribute presence regardless of value.
 *
 * Strategy mirrors PlayPageH1Tag.test.tsx (hoisted-fixture pattern):
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
  const TEST_GAME_ID = "h1-no-id-fixture";
  const TEST_TITLE = "H1 No-Id Fixture Game";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Sentinel description for the W2004 h1 no-id test.",
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

describe("PlayPage h1 has no id attribute (W2004)", () => {
  it("renders the page-title <h1> without an `id` HTML attribute", async () => {
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
    // Pin the attribute-presence fact directly. A regression that added
    // `id="..."` to the heading would flip this from false to true.
    expect(h1!.hasAttribute("id") === false).toBe(true);
  });
});

void React;
