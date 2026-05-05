/**
 * Unit test for the PlayPage `.play-page` root wrapper style-attribute absence
 * (W2105).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1647-1663) computes a `playPageStyle` value:
 *
 *     const playPageStyle = (() => {
 *       const ov = plugin.themeOverrides;
 *       if (!ov) return undefined;
 *       ...
 *     })();
 *
 *     return (
 *       <div
 *         className="play-page"
 *         data-game-id={plugin.id}
 *         onClick={onPrimaryClick}
 *         style={playPageStyle}
 *       >
 *
 *   When the active plugin declares no `themeOverrides`, `playPageStyle` is
 *   `undefined` and React omits the `style` attribute from the rendered DOM
 *   entirely. Plugins without theme overrides therefore produce a `.play-page`
 *   root that has NO inline `style` attribute — its theming flows purely from
 *   the cascaded CSS custom properties owned by ThemePicker / :root, with no
 *   per-game override.
 *
 *   Existing PlayPage root tests cover:
 *     - the className "play-page"             (W1996, PlayPagePageRootClass)
 *     - the wrapper element tagName (DIV)     (W1371, PlayPagePageRootTagName)
 *     - the data-game-id attribute            (W1090, PlayPage.dataGameId)
 *     - the absence of the id attribute       (W2020, PlayPageRootNoId)
 *   but NONE pin the absence of `style` on the `.play-page` root for plugins
 *   that don't declare `themeOverrides`. That gap means an accidental
 *   `style={{}}` graft (e.g. swapping `undefined` for `{}` in the IIFE) would
 *   silently begin emitting an empty inline `style=""` attribute on every
 *   un-themed game, polluting the public DOM contract and breaking anyone who
 *   relies on the root being style-attribute-free for non-themed plugins.
 *
 * This test pins the load-bearing fact: when the active plugin has no
 * `themeOverrides`, the `.play-page` root has NO `style` attribute —
 * `root.hasAttribute("style") === false`. `hasAttribute("style")` returns
 * true for any string value (including ""), so this catches every shape of
 * accidental style graft, not just non-empty ones.
 *
 * Strategy mirrors PlayPageRootNoId.test.tsx:
 *   - Hoisted fixture plugin via vi.hoisted so vi.mock factory captures it.
 *     The fixture deliberately omits `themeOverrides`, exercising the
 *     `if (!ov) return undefined` early-return branch.
 *   - Mount at `/play/:gameId` — the wrapper is rendered in any phase, so
 *     no need to click `start-game`.
 *   - Read the wrapper via container.querySelector(".play-page") and pin
 *     `hasAttribute("style")` to false.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "root-no-style-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Root No-Style Fixture Game",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Sentinel description for the W2105 root style-absence test.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
    // NOTE: deliberately no `themeOverrides` — exercises the
    // `if (!ov) return undefined` branch so React omits `style`.
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

describe("PlayPage .play-page root style-attribute absence (W2105)", () => {
  it("renders the .play-page wrapper with no style attribute when the plugin has no themeOverrides", async () => {
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

    // Pin "no style". `hasAttribute("style")` returns true for any string
    // value (including ""), so this catches every shape of accidental style
    // graft — empty, themed, or hard-coded.
    expect(root!.hasAttribute("style")).toBe(false);
  });
});

void React;
