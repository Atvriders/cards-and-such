/**
 * Unit test for PlayPage settings modal close button click → unmounts (W1012).
 *
 * Sibling tests cover the close button's accessibility surface (W1003 pins
 * its `aria-label="Close settings"`) and alternate dismiss paths
 * (W730 covers Escape-to-close). What none of them lock is the most basic
 * user contract: clicking the visible "X" button should actually dismiss
 * the popover. This test pins exactly that:
 *
 *   - Open the settings popover from `play-settings-btn`.
 *   - Click `play-settings-close`.
 *   - Assert `play-settings-modal` is no longer in the DOM.
 *
 * Without this assertion, a refactor that wires the close button to a
 * no-op (e.g. dropping the onClick handler during a JSX cleanup) would
 * silently strand users with no pointer-driven way to dismiss the modal.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-close-click-fixture";
  const TEST_TITLE = "Settings Close Click Fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for settings modal close button click test.",
    settings: settingsSchema,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, TEST_TITLE, fixturePlugin, settingsSchema };
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

describe("PlayPage settings modal close button click (W1012)", () => {
  it("clicking play-settings-close unmounts the settings modal", async () => {
    await mountPlaying();

    fireEvent.click(screen.getByTestId("play-settings-btn"));

    // Sanity: modal mounted.
    expect(screen.getByTestId("play-settings-modal")).toBeTruthy();

    fireEvent.click(screen.getByTestId("play-settings-close"));

    expect(screen.queryByTestId("play-settings-modal")).toBeNull();
  });
});

void React;
