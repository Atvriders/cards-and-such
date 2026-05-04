/**
 * Unit test for the PlayPage settings modal "Reset to defaults" footer
 * button (W1121, follow-up to the W1089 footer audit).
 *
 * The footer button at `data-testid="play-settings-reset"` calls
 * `setSettings(defaultsOf(plugin.settings))`, which must revert every
 * field in the modal to the schema-declared default. Existing modal
 * tests cover individual field rendering, label text, persistence,
 * and the "Restart now" banner — none of them exercise the reset
 * footer button. If a refactor accidentally swapped the handler out,
 * removed it, or pointed it at the wrong source of defaults, the
 * "Reset to defaults" button would silently no-op (or worse) without
 * any other test failing.
 *
 * This test pins the contract: with a single boolean setting whose
 * schema default is `false`, toggling it to `true` and then clicking
 * `play-settings-reset` puts the toggle back to `false`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-reset-btn-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Reset Btn Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the settings-reset footer button.",
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

describe("PlayPage settings reset-to-defaults footer button (W1121)", () => {
  it("reverts a toggled boolean setting back to the schema default", async () => {
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

    // Sanity: schema default is false.
    const toggle = screen.getByTestId("play-setting-deluxe") as HTMLInputElement;
    expect(toggle.checked).toBe(false);

    // Flip it to true so we have something to reset.
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);

    // Click the footer reset button — should snap back to default.
    fireEvent.click(screen.getByTestId("play-settings-reset"));

    const toggleAfter = screen.getByTestId(
      "play-setting-deluxe",
    ) as HTMLInputElement;
    expect(toggleAfter.checked).toBe(false);
  });
});

// Keep this an unambiguous JSX module under tsconfigs that don't
// auto-inject the React runtime in tests.
void React;
