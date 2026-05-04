/**
 * Unit test for the PlayPage in-game settings modal "How to play" footer
 * button (W1071, follow-up to W1060).
 *
 * The settings modal renders a `play-settings-howto` button in its footer
 * whenever the active plugin defines `howToPlay` text. Clicking it should
 * close the settings dialog AND open the HowToPlayModal in one step — a
 * convenient escape hatch for users who realise mid-fiddle that they need
 * to revisit the rules. None of the existing settings tests exercise this
 * branch, so this dedicated regression locks the behaviour in.
 *
 * Strategy:
 *   - `vi.hoisted` builds a fixture plugin with one boolean setting AND a
 *     `howToPlay` string — the latter is what causes the footer button to
 *     render at all.
 *   - The plugin is mocked into `../games/registry.js` so PlayPage resolves
 *     it without dragging in the real registry / lazy game imports.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-howto-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Howto Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the settings → How to play button.",
    howToPlay: "Pretend rules so the footer button renders.",
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

describe("PlayPage settings modal How to play button (W1071)", () => {
  it("closes the settings modal and opens the How to play modal", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the in-game settings modal — the footer button is only present
    // while the dialog is mounted.
    fireEvent.click(screen.getByTestId("play-settings-btn"));
    expect(screen.getByTestId("play-settings-modal")).toBeTruthy();
    // HowToPlay modal isn't rendered yet.
    expect(screen.queryByTestId("htp-modal")).toBeNull();

    // Click the footer "How to play" button.
    fireEvent.click(screen.getByTestId("play-settings-howto"));

    // Settings modal is gone, HowToPlay modal is up — both transitions
    // happen in the same handler.
    expect(screen.queryByTestId("play-settings-modal")).toBeNull();
    expect(screen.getByTestId("htp-modal")).toBeTruthy();
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
