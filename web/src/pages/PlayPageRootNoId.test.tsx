/**
 * Unit test for the PlayPage `.play-page` root wrapper id-attribute absence
 * (W2020).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1657-1663) renders the outermost page container as
 *     <div className="play-page" data-game-id={plugin.id} ...>
 *   The wrapper is identified for CSS / e2e / analytics via the `play-page`
 *   className and the `data-game-id` data attribute — NOT via a DOM `id`.
 *   The wrapper deliberately carries no `id` attribute.
 *
 *   Existing PlayPage tests cover:
 *     - the className "play-page"             (W1996, PlayPagePageRootClass)
 *     - the wrapper element tagName (DIV)     (W1371, PlayPagePageRootTagName)
 *     - the data-game-id attribute            (W1090, PlayPage.dataGameId)
 *     - the play-panel <section> id absence   (W2013, PlayPagePlayPanelNoId)
 *   but NONE pin the absence of `id` on the `.play-page` root itself. That
 *   gap means an accidental `id="play-page"` (or stylesheet-driven id graft)
 *   could silently land on the page root, expanding the public DOM contract
 *   and breaking anyone who currently relies on the root being identified
 *   purely by its className + data-game-id.
 *
 * This test pins the load-bearing fact: the `.play-page` root has NO `id`
 * attribute — `root.hasAttribute("id") === false`. `hasAttribute` returns
 * true for any string id (including the empty string), so this catches
 * every shape of accidental id graft, not just non-empty ones.
 *
 * Strategy mirrors PlayPagePageRootTagName.test.tsx:
 *   - Hoisted fixture plugin via vi.hoisted so vi.mock factory captures it.
 *   - Mount at `/play/:gameId` — the wrapper is rendered in any phase, so
 *     no need to click `start-game`.
 *   - Read the wrapper via container.querySelector(".play-page") and pin
 *     `hasAttribute("id")` to false.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "root-no-id-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Root No-Id Fixture Game",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Sentinel description for the W2020 root id-absence test.",
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

describe("PlayPage .play-page root id-attribute absence (W2020)", () => {
  it("renders the .play-page wrapper with no id attribute", async () => {
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

    // Pin "no id". `hasAttribute("id")` returns true for any string value
    // (including ""), so this catches every shape of accidental id graft —
    // empty, slug-derived, or hard-coded.
    expect(root!.hasAttribute("id")).toBe(false);
  });
});

void React;
