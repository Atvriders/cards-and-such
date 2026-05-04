/**
 * Unit test for the PlayPage in-game settings modal "Restart now" button
 * inside the dirty banner (W1068, follow-up to W1043 / W1060).
 *
 * The dirty banner contains a "Restart now" affordance that, when clicked,
 * must atomically:
 *   1. Close the settings modal (so the user is returned to the board), and
 *   2. Apply the drifted settings by replaying with the current seed —
 *      which rebuilds the start-of-game snapshot, clearing `settingsDirty`.
 *
 * The (1) and (2) handlers were previously untested as a pair: the
 * companion W1060 test only covers the banner's *appearance*, and the
 * W1046 / W188 modal-apply tests cover the close button + persistence
 * paths. This test exercises the restart-now button itself: the modal
 * disappears immediately, and reopening the modal afterwards confirms
 * the banner is gone — proving the snapshot was refreshed by the replay.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-restart-now-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Restart Now Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the settings restart-now regression.",
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

describe("PlayPage settings modal Restart now (W1068)", () => {
  it("closes the modal and rebuilds the start-of-game snapshot", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the in-game settings modal and dirty the snapshot.
    fireEvent.click(screen.getByTestId("play-settings-btn"));
    expect(screen.getByTestId("play-settings-modal")).toBeTruthy();
    fireEvent.click(screen.getByTestId("play-setting-deluxe"));

    // The dirty banner — and its Restart now button — are now visible.
    const restartNow = screen.getByTestId("play-settings-restart-now");
    expect(restartNow.textContent).toContain("Restart now");

    // Click Restart now: the click handler closes the modal *and* schedules
    // `replay()`, which is async (it awaits confirmIfInProgress). For a
    // freshly-started game, that confirmation short-circuits to true, so
    // the replay runs and refreshes setSettingsAtGameStart.
    fireEvent.click(restartNow);

    // (1) Modal closes synchronously.
    await waitFor(() => {
      expect(screen.queryByTestId("play-settings-modal")).toBeNull();
    });

    // (2) Reopen the modal — the deluxe toggle still reflects the user's
    // intended value (settings state itself is preserved across replay),
    // but the dirty banner is gone because the snapshot was taken *after*
    // the toggle, so live settings now match the snapshot again.
    fireEvent.click(screen.getByTestId("play-settings-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("play-settings-modal")).toBeTruthy();
    });
    const toggleAfter = screen.getByTestId("play-setting-deluxe") as HTMLInputElement;
    expect(toggleAfter.checked).toBe(true);
    expect(screen.queryByTestId("play-settings-restart-banner")).toBeNull();
    expect(screen.queryByTestId("play-settings-restart-now")).toBeNull();
  });
});

void React;
