/**
 * Unit test for PlayPage settings modal element's own className (W1423).
 *
 * The settings modal dialog `<div role="dialog">` carries the structural
 * className `play-settings-modal` which our CSS targets for layout, sizing,
 * background, and z-index. Sibling tests pin various inner attributes
 * (W1315 close button, W1251 header element, W1363 title suffix, W988
 * role/aria-modal, W997 aria-label, etc.) and lookups go through
 * `data-testid="play-settings-modal"`, so a refactor that renamed the
 * className (say to `play-modal`) would silently break CSS without
 * tripping any current test.
 *
 * Strategy mirrors PlayPage.settingsFieldsStructural.test.tsx:
 *   - vi.hoisted fixture plugin so PlayPage mounts cleanly.
 *   - Click `start-game`, then `play-settings-btn` to open the modal.
 *   - Assert the modal's `className` contains `play-settings-modal` and
 *     its tagName is DIV (the structural element type).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-modal-classname-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Modal Classname Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for settings modal className test.",
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

vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage settings modal element className (W1423)", () => {
  it("the open settings modal dialog div carries className `play-settings-modal`", async () => {
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

    const modal = screen.getByTestId("play-settings-modal");
    // Pin both the structural tag and the className so a refactor that
    // renames the class (or replaces the div with another element type)
    // is forced to update this test deliberately.
    expect(modal.tagName).toBe("DIV");
    expect(modal.classList.contains("play-settings-modal")).toBe(true);
  });
});

void React;
