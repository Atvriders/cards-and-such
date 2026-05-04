/**
 * Unit test for the PlayPage outer wrapper element type (W1371).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1657-1663) renders the outermost page container as
 *     <div className="play-page" data-game-id={plugin.id} ...>
 *   The element is intentionally a generic <div>, NOT a <main>/<section>/
 *   <article>/<aside>. Existing PlayPage tests cover:
 *     - the className "play-page"  (existence via querySelector)
 *     - the data-game-id attribute (PlayPage.dataGameId.test.tsx — W1090)
 *     - many descendant structural pieces (header/toolbar/modal headings)
 *   but NO test pins the element TYPE itself. A regression that swapped
 *   the wrapper to e.g. `<main className="play-page">` (or `<section>`)
 *   would silently change the document outline / landmark semantics that
 *   downstream a11y selectors and CSS rules depending on `div.play-page`
 *   rely on, while every existing assertion would still pass.
 *
 * This test pins the load-bearing fact: the `.play-page` root is a DIV.
 *
 * Strategy mirrors PlayPage.dataGameId.test.tsx:
 *   - Hoisted fixture plugin via vi.hoisted so vi.mock factory captures it.
 *   - Mount at `/play/:gameId` — the wrapper is rendered in any phase, so
 *     no need to click `start-game`.
 *   - Read the wrapper via container.querySelector(".play-page") and pin
 *     its tagName.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "tagname-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "TagName Fixture Game",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Sentinel description for the W1371 root tagName test.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin };
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

describe("PlayPage .play-page root element tagName (W1371)", () => {
  it("renders the .play-page wrapper as a <div> element (not main/section/article)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const root = container.querySelector<HTMLElement>(".play-page");

    // Wrapper must exist — a regression that removed/renamed the class
    // would surface here as a null root.
    expect(root).not.toBeNull();

    // tagName is the load-bearing assertion: pins the element type to DIV.
    // jsdom returns tagNames upper-cased for HTML elements.
    expect(root?.tagName).toBe("DIV");
  });
});

void React;
