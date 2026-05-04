/**
 * Unit test for the PlayPage in-game settings modal "Restart to apply"
 * dirty banner (W1060, follow-up to W1043).
 *
 * The settings modal renders a `play-settings-restart-banner` element only
 * when the live settings drift from the snapshot taken at start-of-game.
 * That branch was previously covered by PlayPage.settings.test.tsx, but
 * W1060 splits it into a single focused regression test so the banner's
 * "appears on first change" contract has a dedicated home that won't be
 * accidentally weakened when the broader settings test grows.
 *
 * Strategy:
 *   - `vi.hoisted` builds a fixture plugin with one boolean setting — the
 *     minimum surface needed to dirty the snapshot with a single click.
 *   - The plugin is mocked into `../games/registry.js` so PlayPage resolves
 *     it without dragging in the real registry / lazy game imports.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-dirty-banner-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Dirty Banner Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the settings dirty-banner regression.",
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

describe("PlayPage settings modal dirty banner (W1060)", () => {
  it("renders the Restart to apply banner only after a setting changes", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the in-game settings modal.
    fireEvent.click(screen.getByTestId("play-settings-btn"));

    // Initially settings match the start-of-game snapshot, so the dirty
    // banner is absent from the DOM (not just hidden).
    expect(screen.queryByTestId("play-settings-restart-banner")).toBeNull();

    // Toggle the only boolean setting; this drifts state from the snapshot.
    fireEvent.click(screen.getByTestId("play-setting-deluxe"));

    // Banner now appears with the user-visible "Restart to apply" copy.
    const banner = screen.getByTestId("play-settings-restart-banner");
    expect(banner).toBeTruthy();
    expect(banner.textContent).toContain("Restart to apply");
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
