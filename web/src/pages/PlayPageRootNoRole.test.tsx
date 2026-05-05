/**
 * Unit test for the PlayPage `.play-page` root wrapper role-attribute absence
 * (W2364).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1657-1663) renders the outermost page container as
 *     <div className="play-page" data-game-id={plugin.id} ...>
 *   The wrapper is a plain non-landmark <div> — it carries NO ARIA `role`.
 *   The page's landmark structure is provided by inner regions (the
 *   `<header className="play-header">`, the play-panel `<section>`, the
 *   end-banner `dialog`, etc.), NOT by the outermost `.play-page` div.
 *
 *   Existing PlayPage tests cover:
 *     - className "play-page"        (W1996, PlayPagePageRootClass)
 *     - wrapper tagName DIV          (W1371, PlayPagePageRootTagName)
 *     - data-game-id attribute       (W1090, PlayPage.dataGameId)
 *     - id attribute absence         (W2020, PlayPageRootNoId)
 *     - style attribute absence      (W2105, PlayPageRootNoStyle)
 *     - tabindex attribute absence   (PlayPageRootNoTabindex)
 *     - data-testid absence          (W2063, PlayPageRootDataTestid)
 *   but NONE pin the absence of `role` on the `.play-page` root itself.
 *
 *   That gap matters because an accidental `role="main"` / `role="region"` /
 *   `role="application"` graft on the outer wrapper would silently expand
 *   the page's a11y landmark contract: screen-reader users would suddenly
 *   see two stacked landmarks (the wrapper + the inner header/section),
 *   and `role="application"` in particular would suppress browse-mode
 *   navigation across the whole page. The wrapper is intentionally a
 *   semantically-neutral div; downstream a11y tooling and Cypress/Playwright
 *   selectors that filter by `[role]` rely on the root NOT advertising one.
 *
 * This test pins the load-bearing fact: the `.play-page` root has NO
 * `role` attribute — `root.hasAttribute("role") === false`. `hasAttribute`
 * returns true for any string value (including ""), so this catches every
 * shape of accidental role graft, not just well-formed ARIA roles.
 *
 * Strategy mirrors PlayPageRootNoId.test.tsx:
 *   - Hoisted fixture plugin via vi.hoisted so vi.mock factory captures it.
 *   - Mount at `/play/:gameId` — the wrapper is rendered in any phase, so
 *     no need to click `start-game`.
 *   - Read the wrapper via container.querySelector(".play-page") and pin
 *     `hasAttribute("role")` to false.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "root-no-role-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Root No-Role Fixture Game",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Sentinel description for the W2364 root role-absence test.",
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

describe("PlayPage .play-page root role-attribute absence (W2364)", () => {
  it("renders the .play-page wrapper with no role attribute", async () => {
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

    // Pin "no role". `hasAttribute("role")` returns true for any string
    // value (including ""), so this catches every shape of accidental role
    // graft — empty, "main", "region", "application", or anything else.
    expect(root!.hasAttribute("role")).toBe(false);
  });
});

void React;
