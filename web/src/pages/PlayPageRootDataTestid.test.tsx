/**
 * Unit test for the PlayPage `.play-page` root wrapper data-testid attribute
 * absence (W2063).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1657-1663) renders the outermost page container as
 *     <div className="play-page" data-game-id={plugin.id} ...>
 *   The wrapper carries NO `data-testid` attribute. Existing PlayPage tests
 *   pin neighboring root facts:
 *     - className "play-page"        (W1996, PlayPagePageRootClass)
 *     - tagName DIV                  (W1371, PlayPagePageRootTagName)
 *     - data-game-id attribute       (W1090, PlayPage.dataGameId)
 *     - id attribute absence         (W2020, PlayPageRootNoId)
 *   but NONE pin the absence of `data-testid` on the `.play-page` root. That
 *   gap means an accidental `data-testid="play-page"` (or any value) graft
 *   would silently expand the public DOM testing contract — once a testid
 *   ships, downstream e2e suites (Playwright/Cypress) can latch onto it and
 *   any later removal becomes a breaking change. The wrapper is currently
 *   identified for selectors via className + data-game-id, NOT via a testid.
 *
 * This test pins the load-bearing fact: the `.play-page` root has NO
 * `data-testid` attribute — `root.hasAttribute("data-testid") === false`.
 * `hasAttribute` returns true for any string value (including ""), so this
 * catches every shape of accidental testid graft, not just non-empty ones.
 *
 * Strategy mirrors PlayPageRootNoId.test.tsx:
 *   - Hoisted fixture plugin via vi.hoisted so vi.mock factory captures it.
 *   - Mount at `/play/:gameId` — the wrapper is rendered in any phase, so
 *     no need to click `start-game`.
 *   - Read the wrapper via container.querySelector(".play-page") and pin
 *     `hasAttribute("data-testid")` to false.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "root-data-testid-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Root DataTestid Fixture Game",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Sentinel description for the W2063 root data-testid absence test.",
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

describe("PlayPage .play-page root data-testid attribute absence (W2063)", () => {
  it("renders the .play-page wrapper with no data-testid attribute", async () => {
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

    // Pin "no data-testid". `hasAttribute("data-testid")` returns true for
    // any string value (including ""), so this catches every shape of
    // accidental testid graft — empty, "play-page", or anything else.
    expect(root!.hasAttribute("data-testid")).toBe(false);
  });
});

void React;
