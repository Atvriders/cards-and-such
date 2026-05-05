/**
 * Unit test for the PlayPage info popover action-log <ol> inline
 * `overflow-y` style (W1718).
 *
 * The action-log <ol> under the info popover ships an inline
 * `style={{ maxHeight: 160, overflowY: "auto", ... }}` so the rolling
 * breadcrumb list stays inside a scrollable 160px viewport. Existing
 * sibling tests pin the <details>/<summary> wrapper className (W1330),
 * the summary cursor (W1477), the <ol> className (W1490), the inline
 * `max-height` (W1496), the empty-state copy (W1379), the inline
 * `list-style` (W1702), and the inline `font-size` (W1714) — but none
 * assert the `overflow-y: auto` rule itself. A regression that dropped
 * the overflow rule (e.g. switching to `overflow: hidden`, or simply
 * removing the property) would silently clip the action-log entries
 * past the 160px cap with no scrollbar — leaving the user unable to
 * read the most recent breadcrumbs once the log filled.
 *
 * Strategy:
 *   - Render PlayPage with a no-op fixture plugin so the info popover
 *     mounts in a deterministic state.
 *   - Click the info button to open the popover so <details>/<ol>
 *     mount.
 *   - Resolve the action-log <ol> via `data-testid="play-action-log"`
 *     and assert `style.overflowY` is exactly `"auto"`.
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
  const TEST_GAME_ID = "info-action-log-ol-overflowy-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Action Log Ol OverflowY Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log <ol> overflow-y test.",
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

describe("PlayPage info popover action-log <ol> overflow-y (W1718)", () => {
  it("renders the action-log list with inline overflowY exactly 'auto' so capped content stays scrollable instead of being clipped", async () => {
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

    // Pin the inline overflow rule. Exact-equality on "auto" guards
    // against the property being dropped or relaxed to "hidden"/
    // "visible", either of which would silently clip the action log
    // past the 160px maxHeight rather than presenting a scrollbar.
    const log = screen.getByTestId("play-action-log") as HTMLOListElement;
    expect(log.style.overflowY).toBe("auto");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
