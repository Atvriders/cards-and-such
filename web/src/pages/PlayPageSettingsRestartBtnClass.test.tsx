/**
 * Unit test for the PlayPage in-game settings modal dirty-banner
 * "Restart now" button className (W1517).
 *
 * Background: PlayPage.tsx renders the dirty banner's restart action as a
 * <button class="play-settings-restart-btn" data-testid="play-settings-
 * restart-now">. Existing W1068 covers click behavior; W1043/W1060 cover
 * the banner wrapper. None of them assert the button's className itself,
 * leaving the styling hook uncovered. This test pins
 * `className === "play-settings-restart-btn"` so future refactors can't
 * silently drop the CSS hook.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-restart-btn-class-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Restart Btn Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the settings restart-btn-class regression.",
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
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage settings dirty-banner Restart btn className (W1517)", () => {
  it("uses className 'play-settings-restart-btn' on the Restart now button", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the in-game settings modal and dirty the snapshot so the
    // restart-now banner button is rendered.
    fireEvent.click(screen.getByTestId("play-settings-btn"));
    fireEvent.click(screen.getByTestId("play-setting-deluxe"));

    const restartBtn = screen.getByTestId("play-settings-restart-now");
    expect(restartBtn.className).toBe("play-settings-restart-btn");
  });
});

void React;
