/**
 * Unit test for PlayPage in-modal settings change propagation (W1046).
 *
 * Companion coverage to:
 *   - W727 setup-screen settings → initialState
 *   - W761 family deep-link settings
 *   - W730 Esc closes the modal
 *   - W188 (settingsPersist.test.tsx) toggle → localStorage round-trip
 *
 * The unique slice this test exercises: a setting changed *inside* the
 * already-open in-game settings modal survives closing the modal — the
 * close path doesn't roll back the value, and the persisted payload in
 * `cards-game-settings:<gameId>` reflects the toggled state after the
 * modal is dismissed via the explicit close button.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-modal-apply-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Modal Apply Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for in-modal settings change tests.",
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

describe("PlayPage in-modal settings change persists across close (W1046)", () => {
  it("toggling a play-setting-<key> control then closing the modal keeps the new value", async () => {
    const storageKey = `cards-game-settings:${hoisted.TEST_GAME_ID}`;

    await mountPlaying();

    // Open the in-game settings modal via the toolbar button.
    fireEvent.click(screen.getByTestId("play-settings-btn"));
    expect(screen.getByTestId("play-settings-modal")).toBeTruthy();

    // Toggle the boolean setting from its default (false) to true.
    const toggle = screen.getByTestId("play-setting-deluxe") as HTMLInputElement;
    expect(toggle.checked).toBe(false);
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);

    // Close the modal via the explicit close button — verifies the change
    // is *not* reverted when the dialog is dismissed (no implicit cancel).
    fireEvent.click(screen.getByTestId("play-settings-close"));
    await waitFor(() => {
      expect(screen.queryByTestId("play-settings-modal")).toBeNull();
    });

    // The persisted payload reflects the in-modal change post-close.
    await waitFor(() => {
      const raw = localStorage.getItem(storageKey);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw as string) as Record<string, unknown>;
      expect(parsed.deluxe).toBe(true);
    });

    // Reopen the modal — the toggle reflects the new value, confirming the
    // in-memory settings state (and hence what feeds initialState on next
    // replay) is consistent with the persisted payload.
    fireEvent.click(screen.getByTestId("play-settings-btn"));
    const toggleAfter = screen.getByTestId("play-setting-deluxe") as HTMLInputElement;
    expect(toggleAfter.checked).toBe(true);
  });
});

void React;
