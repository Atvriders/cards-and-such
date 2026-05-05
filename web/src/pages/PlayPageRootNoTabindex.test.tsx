/**
 * Unit test for the PlayPage `.play-page` root wrapper tabindex-attribute
 * absence (W2232).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1657-1663) renders the outermost page container as
 *     <div className="play-page" data-game-id={plugin.id} ...>
 *   The wrapper is a plain non-interactive layout container — it has no
 *   `tabIndex` JSX prop in the source, so React renders no `tabindex`
 *   attribute on the resulting DOM node. The page surfaces focusable
 *   controls (back link, info button, settings button, in-game widgets)
 *   inside the wrapper; the wrapper itself must not be in the tab order
 *   nor programmatically focusable via `tabindex="-1"`.
 *
 *   Existing PlayPage tests cover the wrapper's:
 *     - className "play-page"             (W1996, PlayPagePageRootClass)
 *     - tagName (DIV)                     (W1371, PlayPagePageRootTagName)
 *     - data-game-id attribute            (W1090, PlayPage.dataGameId)
 *     - id-attribute absence              (W2020, PlayPageRootNoId)
 *     - inline style absence              (W..., PlayPageRootNoStyle)
 *     - data-testid absence               (W..., PlayPageRootDataTestid)
 *   Sibling `tabindex` tests pin OTHER elements' tabindex contracts
 *   (LobbyChipStripNoTabindex, PlayPageInfoPopoverTabIndex,
 *   PlayPage.settingsModalTabIndex, etc.) but NONE pin the absence of
 *   `tabindex` on the `.play-page` root itself. That gap means an
 *   accidental `tabIndex={-1}` or `tabIndex={0}` graft could silently
 *   make the wrapper focusable, breaking expected tab-order semantics
 *   and screen-reader navigation.
 *
 * This test pins the load-bearing fact: the `.play-page` root has NO
 * `tabindex` attribute — `root.hasAttribute("tabindex") === false`.
 * `hasAttribute("tabindex")` returns true for any string value (including
 * "-1", "0", or ""), so this catches every shape of accidental tabindex
 * graft, not just positive ones.
 *
 * Strategy mirrors PlayPageRootNoId.test.tsx:
 *   - Hoisted fixture plugin via vi.hoisted so vi.mock factory captures it.
 *   - Mount at `/play/:gameId` — the wrapper is rendered in any phase, so
 *     no need to click `start-game`.
 *   - Read the wrapper via container.querySelector(".play-page") and pin
 *     `hasAttribute("tabindex")` to false.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "root-no-tabindex-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Root No-Tabindex Fixture Game",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Sentinel description for the W2232 root tabindex-absence test.",
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

describe("PlayPage .play-page root tabindex-attribute absence (W2232)", () => {
  it("renders the .play-page wrapper with no tabindex attribute", async () => {
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

    // Pin "no tabindex". `hasAttribute("tabindex")` returns true for any
    // string value (including "-1", "0", ""), so this catches every shape
    // of accidental tabindex graft — programmatic-focusable, tab-order
    // grafted, or empty-string.
    expect(root!.hasAttribute("tabindex")).toBe(false);
  });
});

void React;
