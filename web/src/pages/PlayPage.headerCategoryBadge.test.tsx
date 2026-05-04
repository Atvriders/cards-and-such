/**
 * Unit test for the PlayPage header category badge (W890).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1672) renders a `<span>` inside the
 *   `.play-header-titlerow` carrying two class names —
 *   `play-category` and `play-category--<plugin.category>` — whose
 *   text content equals the plugin's `category` string. The badge is
 *   the only visible signal that links a round back to the lobby's
 *   category taxonomy (cards / solitaire / dice / board / arcade) and
 *   it ships color tokens via the `--<category>` modifier class so a
 *   regression that swapped the modifier or dropped the textContent
 *   would silently break visual category-coding while every other
 *   header test (h1 title, info-btn, etc.) continued to pass.
 *
 *   Sibling tests cover the win/loss banners, info popover, hint chip,
 *   toolbar buttons, and many more — but no test pins the header
 *   category badge contract. This is general PlayPage UX, outside any
 *   end-of-round banner.
 *
 * Strategy mirrors PlayPage.infoSeedShown.test.tsx:
 *   - A hoisted fixture plugin with `category: "cards"` so the mocked
 *     registry resolves the lookup without a TDZ violation.
 *   - The header (and the badge inside it) renders in *any* phase, so
 *     we don't even need to start the game; mounting at
 *     `/play/:gameId` is enough to assert the contract.
 *   - Pin three properties of the rendered badge:
 *       1. The textContent matches the plugin's category string.
 *       2. The element carries the base `play-category` class.
 *       3. The element carries the per-category modifier
 *          `play-category--cards` — pinning the dynamic class join.
 *   - We use `querySelector(".play-category")` because the badge is a
 *     pure styling span without an aria role or data-testid, which is
 *     itself part of the contract under test.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate, so
// the closure capture below is safe despite the TDZ-like appearance.
// We pin `category: "cards"` so we can assert the modifier class
// `play-category--cards` is concatenated correctly.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-category-badge-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Category Badge Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the header category badge test.",
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

describe("PlayPage header category badge (W890)", () => {
  it("renders the plugin's category in a `play-category play-category--<category>` span", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // The header is rendered top-level inside PlayPage's return — it is
    // present in setup, playing, and ended phases. So we don't need to
    // click `start-game` to find the badge.
    const badge = container.querySelector(
      ".play-header-titlerow .play-category",
    );

    // Existence: a regression that dropped the badge entirely (or
    // moved it outside the header titlerow) would surface here.
    expect(badge).not.toBeNull();

    // Text contract: the rendered text is the plugin.category string,
    // which the lobby links back to. A regression that swapped the
    // text for the title, id, or a translation key would surface here.
    expect(badge?.textContent?.trim()).toBe("cards");

    // Class contract — base + modifier. The modifier class is what
    // drives the per-category color token (.play-category--cards has
    // its own color/background/border in PlayPage.css), so dropping
    // the dynamic join would silently de-color the badge while every
    // other header test continued to pass.
    expect(badge?.classList.contains("play-category")).toBe(true);
    expect(badge?.classList.contains("play-category--cards")).toBe(true);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
