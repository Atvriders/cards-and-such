/**
 * Unit test for PlayPage settings modal header element (W1251).
 *
 * Sibling tests pin the dialog wrapper (role/aria-modal/aria-label,
 * tabIndex), the visible <h2> title, and the close button's aria-label.
 * None of them inspect the *header* element that wraps the title and
 * close button. This test locks that contract:
 *
 *   - The element with class `play-settings-modal-header` is a real
 *     `<header>` landmark (not a styled <div>), so it shows up in
 *     accessibility tree landmark navigation.
 *   - It is a direct child of the `data-testid="play-settings-modal"`
 *     dialog so the structural relationship between the dialog and its
 *     header is preserved.
 *
 * Without this assertion, a refactor that flattened the header into a
 * <div> or hoisted it outside the dialog would slip past the existing
 * aria/title-only checks.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-modal-header-el-fixture";
  const TEST_TITLE = "Settings Modal Header El Fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for settings modal header element test.",
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

describe("PlayPage settings modal header element (W1251)", () => {
  it("the .play-settings-modal-header is a <header> inside the dialog", async () => {
    await mountPlaying();

    fireEvent.click(screen.getByTestId("play-settings-btn"));

    const modal = screen.getByTestId("play-settings-modal");
    const headerEl = modal.querySelector(".play-settings-modal-header");
    expect(headerEl).toBeTruthy();
    expect(headerEl!.tagName).toBe("HEADER");
    expect(headerEl!.parentElement).toBe(modal);
  });
});

void React;
