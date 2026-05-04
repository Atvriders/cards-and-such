/**
 * Unit test for the PlayPage header title (W896).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1673) renders an `<h1>` inside the
 *   `.play-header-titlerow` whose text content equals `plugin.title`.
 *   The h1 is the page's primary heading — it anchors the document
 *   outline (a11y + SEO) and tells the player which game they have
 *   loaded. A regression that swapped the source field (e.g. `id`
 *   instead of `title`), demoted it from `<h1>` to a `<span>`/`<div>`,
 *   or moved it outside the header titlerow would silently break the
 *   document outline while the sibling category badge (W890) test
 *   would continue to pass.
 *
 *   Sibling tests cover the category badge, info popover, hint chip,
 *   toolbar buttons, and the win banner heading — but no test pins
 *   the header `<h1>` title contract for a *non-win* render.
 *
 * Strategy mirrors PlayPage.headerCategoryBadge.test.tsx:
 *   - A hoisted fixture plugin with a distinctive `title` so we can
 *     pin the text content unambiguously (no false positives from
 *     "Play" prefixes elsewhere).
 *   - The header (and the h1 inside it) renders in *any* phase, so
 *     mounting at `/play/:gameId` is enough to assert the contract;
 *     no need to click `start-game`.
 *   - Pin three properties of the rendered title:
 *       1. The element exists inside `.play-header-titlerow`.
 *       2. The element is an `<h1>` (tag name contract).
 *       3. Its textContent equals `plugin.title` exactly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// We pick a deliberately distinctive title so the textContent assertion
// can't accidentally match a sibling string (e.g. the PageHead's
// `Play <title>` document title, which is in <head>, not in the body).
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-title-fixture";
  const TEST_TITLE = "Header Title Fixture Game";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the header title test.",
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

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// render side-effect-free even though we never reach the win banner.
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

describe("PlayPage header title (W896)", () => {
  it("renders the plugin's title as an <h1> inside .play-header-titlerow", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Scope to the header titlerow so we don't accidentally pick up an
    // h1 emitted by some unrelated child (the win banner uses h2, but
    // future regressions could add stray headings elsewhere).
    const heading = container.querySelector(
      ".play-header-titlerow h1",
    );

    // Existence + tag name: a regression that demoted the heading to a
    // span/div, or moved it outside the titlerow, would surface here.
    expect(heading).not.toBeNull();
    expect(heading?.tagName).toBe("H1");

    // Text contract: the rendered text is the plugin.title string, NOT
    // `plugin.id` and NOT `Play <title>` (which is the document <title>
    // emitted by PageHead, a different element). A regression that
    // swapped the source field would surface here.
    expect(heading?.textContent).toBe(hoisted.TEST_TITLE);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
