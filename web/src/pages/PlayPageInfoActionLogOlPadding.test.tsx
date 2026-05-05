/**
 * Unit test for the PlayPage info popover action-log <ol> inline
 * `padding` style (W1724).
 *
 * The action-log <ol> under the info popover ships an inline
 * `style={{ ..., padding: 0, ... }}` to wipe the user-agent default
 * left padding browsers apply to <ol> elements. Without it, the
 * action-log entries would sit visibly indented from the popover's
 * body copy — breaking the flush left edge the popover layout
 * depends on for its compact, rolling-breadcrumb feel. Existing
 * sibling tests pin the <ol> className (W1490), the inline
 * max-height (W1496), the inline list-style (W1702), the inline
 * font-size (W1714), and the inline overflow-y (W1718), but none
 * assert the inline padding reset. A regression that dropped the
 * property (e.g. trusting an inherited reset stylesheet that later
 * gets scoped away) would let the user-agent's default ~40px
 * left-padding bleed back in, silently breaking the alignment.
 *
 * Strategy:
 *   - Render PlayPage with a no-op fixture plugin so the info popover
 *     mounts in a deterministic state.
 *   - Click the info button to open the popover so <details>/<ol>
 *     mount.
 *   - Resolve the action-log <ol> via `data-testid="play-action-log"`
 *     and assert `style.padding` is exactly `"0px"`.
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
  const TEST_GAME_ID = "info-action-log-ol-padding-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Action Log Ol Padding Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log <ol> padding test.",
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

describe("PlayPage info popover action-log <ol> padding (W1724)", () => {
  it("renders the action-log list with inline padding reset to '0px' so user-agent <ol> indent doesn't bleed into the popover layout", async () => {
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

    // Pin the inline padding reset. React serialises the numeric `0`
    // shorthand as `"0px"` in jsdom, so an exact-equality check guards
    // against either a dropped property *or* a re-introduced indent.
    const log = screen.getByTestId("play-action-log") as HTMLOListElement;
    expect(log.style.padding).toBe("0px");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
