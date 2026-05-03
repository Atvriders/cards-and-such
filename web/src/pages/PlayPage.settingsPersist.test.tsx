/**
 * Unit test for PlayPage per-game settings persistence (W188).
 *
 * Covers the round-trip:
 *   1. Toggling a `kind: "boolean"` setting in the popover writes to
 *      `cards-game-settings:<gameId>` localStorage.
 *   2. Unmounting and remounting PlayPage restores the persisted value
 *      (the toggle reflects the previously-written state, not the
 *      schema default).
 *
 * Strategy mirrors PlayPage.settings.test.tsx: a `vi.hoisted` fixture
 * plugin with a single boolean setting, mocked into the games registry so
 * we don't pull in real plugins.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-persist-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
    hardMode: { kind: "boolean" as const, default: false, label: "Hard mode" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Persist Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for settings persistence tests.",
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
  cleanup();
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

describe("PlayPage settings persistence (W188)", () => {
  it("toggles persist to cards-game-settings:<gameId> and restore on remount", async () => {
    const storageKey = `cards-game-settings:${hoisted.TEST_GAME_ID}`;

    // --- First mount: flip both toggles, expect localStorage to record them.
    await mountPlaying();
    fireEvent.click(screen.getByTestId("play-settings-btn"));

    const deluxe = screen.getByTestId("play-setting-deluxe") as HTMLInputElement;
    const hardMode = screen.getByTestId("play-setting-hardMode") as HTMLInputElement;
    expect(deluxe.checked).toBe(false);
    expect(hardMode.checked).toBe(false);

    fireEvent.click(deluxe);
    fireEvent.click(hardMode);

    // The persistence effect runs after the state update. Wait for the
    // expected payload rather than reading synchronously.
    await waitFor(() => {
      const raw = localStorage.getItem(storageKey);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw as string) as Record<string, unknown>;
      expect(parsed.deluxe).toBe(true);
      expect(parsed.hardMode).toBe(true);
    });

    // --- Tear down and remount fresh: persisted values should be restored.
    cleanup();
    await mountPlaying();
    fireEvent.click(screen.getByTestId("play-settings-btn"));

    const deluxeAfter = screen.getByTestId("play-setting-deluxe") as HTMLInputElement;
    const hardModeAfter = screen.getByTestId("play-setting-hardMode") as HTMLInputElement;
    expect(deluxeAfter.checked).toBe(true);
    expect(hardModeAfter.checked).toBe(true);
  });
});

void React;
