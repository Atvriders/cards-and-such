/**
 * Unit test for the PlayPage outer wrapper element's exact className (W1996).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1657-1663) renders the outermost page container as
 *     <div className="play-page" data-game-id={plugin.id} ...>
 *   The wrapper carries a SINGLE class — "play-page" — with no extra tokens
 *   (no state classes, no theme suffixes, no game-id slug). The exact string
 *   is load-bearing: CSS rules in PlayPage.css and a-11y/E2E selectors target
 *   `.play-page` specifically, and per-game CSS-var overrides (themeFelt /
 *   themeAccent / themeBg) are scoped to this single-class root.
 *
 * Existing PlayPage tests:
 *   - PlayPagePageRootTagName.test.tsx (W1371) pins the tagName as DIV
 *   - PlayPage.dataGameId.test.tsx (W1090) pins the data-game-id attribute
 *   - Many tests rely on `container.querySelector(".play-page")` for EXISTENCE
 *   None pin the EXACT className string — a regression that appended state
 *   like `className={\`play-page play-page--\${plugin.id}\`}` would still
 *   satisfy every existing selector while breaking external CSS overrides
 *   and tests that rely on the single-token class form.
 *
 * This test pins the load-bearing fact: root.className === "play-page".
 *
 * Strategy mirrors PlayPagePageRootTagName.test.tsx:
 *   - Hoisted fixture plugin via vi.hoisted so vi.mock factory captures it.
 *   - Mount at `/play/:gameId` — the wrapper is rendered in any phase.
 *   - Read the wrapper via container.querySelector(".play-page") and assert
 *     its `.className` is EXACTLY "play-page".
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "rootclass-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "RootClass Fixture Game",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Sentinel description for the W1996 root className test.",
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

describe("PlayPage .play-page root className exact equality (W1996)", () => {
  it('root wrapper className is exactly "play-page" (no extra tokens)', async () => {
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

    // Exact-equality is the load-bearing assertion: the wrapper carries a
    // single token, "play-page", with no state/theme/id suffixes appended.
    expect(root?.className).toBe("play-page");
  });
});

void React;
