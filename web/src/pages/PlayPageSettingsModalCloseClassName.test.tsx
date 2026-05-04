/**
 * Unit test for PlayPage settings modal close button className (W1483).
 *
 * Sibling tests pin the close button's type=button (W1315), aria-label
 * (W988 / aria-label suite), SVG aria-hidden (W1447), SVG viewBox (W1455),
 * and click-to-close behaviour. None of them assert the close button's
 * own `className="play-settings-close"`, which the matching CSS in
 * PlayPage.css relies on for layout, hover, and focus styling.
 *
 * Without this pin, a refactor that renamed the class (e.g. to
 * `play-settings-close-btn`) or dropped it in favour of inline styles
 * would slip past the existing data-testid + aria checks while breaking
 * the visual close affordance for every game.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-modal-close-classname-fixture";
  const TEST_TITLE = "Settings Modal Close ClassName Fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for settings modal close className test.",
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

describe("PlayPage settings modal close button className (W1483)", () => {
  it("the play-settings-close button carries className=\"play-settings-close\"", async () => {
    await mountPlaying();

    fireEvent.click(screen.getByTestId("play-settings-btn"));

    const closeBtn = screen.getByTestId("play-settings-close");
    expect(closeBtn.classList.contains("play-settings-close")).toBe(true);
  });
});

void React;
