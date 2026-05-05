/**
 * Unit test for the PlayPage info popover action-log <ol> inline
 * `margin` style (W1730).
 *
 * The action-log <ol> under the info popover ships an inline
 * `style={{ ..., margin: "6px 0 0", ... }}` to (a) carve a small
 * 6px breathing-gap below the "Action log (N)" <summary> while
 * (b) zeroing out the user-agent default vertical margin browsers
 * apply to <ol> elements at the bottom and on the inline axis.
 * Without it, the <ol> would either butt right up against the
 * summary (no gap) or push the popover taller via a stray bottom
 * margin — breaking the compact rolling-breadcrumb feel the
 * popover layout depends on. Existing sibling tests pin the <ol>
 * className (W1490), the inline max-height (W1496), the inline
 * list-style (W1702), the inline font-size (W1714), the inline
 * overflow-y (W1718), and the inline padding reset (W1724), but
 * none assert the inline margin shorthand. A regression that
 * dropped the property (e.g. swapping to a class-only reset that
 * later gets scoped away) would let the UA default ~16px top/bottom
 * margins bleed back in and shove the popover layout around.
 *
 * Strategy:
 *   - Render PlayPage with a no-op fixture plugin so the info popover
 *     mounts in a deterministic state.
 *   - Click the info button to open the popover so <details>/<ol>
 *     mount.
 *   - Resolve the action-log <ol> via `data-testid="play-action-log"`
 *     and assert `style.margin` is exactly `"6px 0px 0px"` (jsdom
 *     normalises the `"6px 0 0"` shorthand by appending `px` units
 *     to bare zeros).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin — vi.hoisted runs before vi.mock factories evaluate,
// so the closure capture below is safe despite resembling a TDZ pattern.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-action-log-ol-margin-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Action Log Ol Margin Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log <ol> margin test.",
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

describe("PlayPage info popover action-log <ol> margin (W1730)", () => {
  it("renders the action-log list with inline margin '6px 0px 0px' so the <ol> sits 6px below the summary without UA bottom/inline margins bleeding in", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Enter playing phase so the info button is available and the
    // action-log section mounts inside the popover.
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the info popover so the <details>/<ol> mounts.
    fireEvent.click(screen.getByTestId("play-info-btn"));
    expect(screen.getByTestId("play-info-popover")).toBeTruthy();

    // Pin the inline margin shorthand. jsdom normalises the
    // `"6px 0 0"` source to `"6px 0px 0px"` (bare zeros gain `px`
    // units), so the exact-equality check guards against either a
    // dropped property *or* a re-introduced UA default margin.
    const log = screen.getByTestId("play-action-log") as HTMLOListElement;
    expect(log.style.margin).toBe("6px 0px 0px");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
