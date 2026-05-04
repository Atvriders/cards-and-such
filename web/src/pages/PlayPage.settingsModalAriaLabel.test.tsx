/**
 * Unit test for PlayPage settings modal aria-label (W997).
 *
 * Sibling W988 test pins `role="dialog"` and `aria-modal="true"` on the
 * settings modal, and notes that the modal also carries an aria-label
 * derived from the plugin title (so screen readers announce *which*
 * game's settings dialog is open). This test locks that contract:
 *
 *   - `aria-label` equals `"<plugin.title> settings"`
 *
 * Without this assertion, a refactor that drops aria-label (or changes
 * it to e.g. aria-labelledby pointing at a stale node) would silently
 * leave the dialog announced only as "dialog" with no name.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-modal-aria-label-fixture";
  const TEST_TITLE = "Settings Modal Aria-Label Fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for settings modal aria-label test.",
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

describe("PlayPage settings modal aria-label (W997)", () => {
  it("the open settings modal exposes aria-label='<title> settings'", async () => {
    await mountPlaying();

    fireEvent.click(screen.getByTestId("play-settings-btn"));

    const modal = screen.getByTestId("play-settings-modal");
    expect(modal.getAttribute("aria-label")).toBe(
      `${hoisted.TEST_TITLE} settings`,
    );
  });
});

void React;
