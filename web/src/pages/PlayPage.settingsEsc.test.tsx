/**
 * Unit test for PlayPage per-game settings popover Esc-to-close (W730).
 *
 * Covers an accessibility behavior not exercised by the existing settings
 * tests (`PlayPage.settings.test.tsx` opens/changes/restarts; the persist
 * test rounds-trips to localStorage). Specifically:
 *
 *   - With the popover open, pressing Escape on `window` closes the modal
 *     (the keydown listener is bound at capture, so it fires regardless
 *     of focus being on the modal itself).
 *   - After close, focus is returned to the trigger (`play-settings-btn`)
 *     so keyboard users don't lose their place in the toolbar.
 *
 * The fixture mirrors the boolean-only schema used by the sibling tests so
 * we exercise the real popover render path without dragging in real plugins.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-esc-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Esc Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for settings popover Esc-to-close test.",
    settings: settingsSchema,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin, settingsSchema };
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

async function mountPlaying(): Promise<void> {
  const { default: PlayPage } = await import("./PlayPage.js");
  render(
    <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
      <Routes>
        <Route path="/play/:gameId" element={<PlayPage />} />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByTestId("start-game"));
}

describe("PlayPage settings popover Esc-to-close (W730)", () => {
  it("Escape closes the open popover and returns focus to the trigger", async () => {
    await mountPlaying();

    const trigger = screen.getByTestId("play-settings-btn");
    fireEvent.click(trigger);

    // Sanity: modal mounted.
    expect(screen.getByTestId("play-settings-modal")).toBeTruthy();

    // The handler is registered on `window` at capture phase, so dispatch
    // the keydown there directly — fireEvent.keyDown(window, ...) bubbles
    // through the capture-phase listener PlayPage installs while the modal
    // is open.
    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByTestId("play-settings-modal")).toBeNull();
    // Focus returns to the trigger so keyboard users don't get lost.
    expect(document.activeElement).toBe(trigger);
  });
});

void React;
