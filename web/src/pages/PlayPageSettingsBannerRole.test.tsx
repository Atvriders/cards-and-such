/**
 * Unit test for the PlayPage in-game settings modal "Restart to apply"
 * dirty-banner ARIA role hook (W1531).
 *
 * The dirty banner is rendered with `role="status"` so that assistive
 * technology announces the warning when settings drift mid-game. The
 * sibling tests already pin the wrapper's className (W1523) and the
 * "Restart now" button class (W1517), and the visible "Restart to apply"
 * copy is asserted by the W1060/settingsDirtyBanner suites — but the
 * banner's role attribute itself was never asserted, so a regression that
 * dropped the role (or swapped it for `alert`/`region`) would silently
 * break the screen-reader announcement.
 *
 * This test pins that one attribute: dirty the snapshot with a single
 * boolean toggle, then read `role` directly off the banner node.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-banner-role-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Banner Role Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the dirty-banner role regression.",
    settings: settingsSchema,
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

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage settings dirty banner role (W1531)", () => {
  it("tags the dirty banner with role=status for screen-reader announcement", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));
    fireEvent.click(screen.getByTestId("play-settings-btn"));

    // Toggle the only boolean to drift settings from the start-of-game
    // snapshot — this is what mounts the dirty banner.
    fireEvent.click(screen.getByTestId("play-setting-deluxe"));

    const banner = screen.getByTestId("play-settings-restart-banner");
    // role=status is the contract that lets AT announce the warning when
    // the user drifts a setting mid-game; pin it so a regression that
    // drops it (or swaps to alert/region) is caught immediately.
    expect(banner.getAttribute("role")).toBe("status");
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
