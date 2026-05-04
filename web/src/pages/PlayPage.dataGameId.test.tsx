/**
 * Unit test for the PlayPage `.play-page` root data-game-id attribute (W1090).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1660) renders the outer wrapper as
 *     <div className="play-page" data-game-id={plugin.id} ...>
 *   The `data-game-id` attribute is the load-bearing piece — it pins the
 *   active game's id onto the play page root so per-game CSS, e2e selectors,
 *   and analytics can scope queries by `[data-game-id="<id>"]`. No existing
 *   PlayPage test pins this attribute; a regression that:
 *     - dropped the `data-game-id` prop from the wrapper,
 *     - swapped `plugin.id` for `plugin.title` (or any other field),
 *     - or moved the attribute onto a child element,
 *   would silently break those external selectors while every in-body
 *   PlayPage test continued to pass.
 *
 * Strategy mirrors PlayPage.canonical.test.tsx:
 *   - Hoisted fixture plugin with the literal id "test-game" so we can
 *     assert the exact attribute string without interpolation ambiguity.
 *   - Mount at `/play/:gameId` — the wrapper renders in any phase so we
 *     don't need to click `start-game`.
 *   - Read the attribute directly off the `.play-page` root.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// The id is the literal "test-game" so the assertion can compare the
// data-game-id attribute string verbatim.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "test-game";
  const TEST_TITLE = "DataGameId Fixture Game";
  const TEST_DESCRIPTION = "Sentinel description for the W1090 data-game-id test.";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: TEST_DESCRIPTION,
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

describe("PlayPage .play-page root data-game-id attribute (W1090)", () => {
  it("sets data-game-id on the .play-page root to the active plugin's id", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // The wrapper is the page root — querySelector on `.play-page`
    // pins both the class hook AND that the data attribute lives on
    // that exact element (not a child).
    const root = container.querySelector<HTMLDivElement>(".play-page");

    // Existence: the page must have rendered the wrapper. A regression
    // that removed the wrapper class or failed to mount would surface
    // here as a null root.
    expect(root).not.toBeNull();

    // Exact attribute value: pins the literal `plugin.id` string. A
    // regression that swapped the field (e.g. `plugin.title`) or
    // dropped the attribute entirely would surface here.
    expect(root?.getAttribute("data-game-id")).toBe("test-game");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
