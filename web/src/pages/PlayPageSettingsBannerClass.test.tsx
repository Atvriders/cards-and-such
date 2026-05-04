/**
 * Unit test for the PlayPage in-game settings modal "Restart to apply"
 * dirty-banner CSS class hook (W1523).
 *
 * The dirty banner exposes the `play-settings-banner` className that the
 * stylesheet hangs the warning treatment off of. Existing tests confirm the
 * banner mounts and carries the user-visible "Restart to apply" copy
 * (W1060/settings.test) plus the restart-now button class (W1517) — but the
 * wrapper element's own className was never asserted, so a stylesheet-rename
 * regression would silently strip the banner styling.
 *
 * This test pins that one attribute: dirty the snapshot with a single
 * boolean toggle, then read `className` directly off the banner node.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-banner-class-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Banner Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the dirty-banner className regression.",
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

describe("PlayPage settings dirty banner className (W1523)", () => {
  it("tags the dirty banner wrapper with the play-settings-banner class", async () => {
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
    // The class is what hangs the warning styling off this element; pin it
    // explicitly so a stylesheet-rename can't silently drop the visual.
    expect(banner.className).toBe("play-settings-banner");
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
