/**
 * Unit test for PlayPage settings modal close button `type` attribute
 * (W1315).
 *
 * Sibling tests pin the close button's accessible name (W1003,
 * `aria-label="Close settings"`) and its dismiss behavior (clicking it
 * unmounts the modal). They do not, however, lock down the explicit
 * `type="button"` attribute on that control.
 *
 * Why this matters: the close button lives inside the settings modal,
 * which is rendered while a game is being played. The settings modal is
 * NOT inside a `<form>` today, but the surrounding fields render inputs
 * and toggles that an unrelated refactor could later wrap into a form
 * (e.g. for native validation or an Apply submission). Browsers default
 * any unmarked `<button>` to `type="submit"`, which would cause the
 * close "X" to submit that hypothetical form and reload the page —
 * silently breaking the dismiss affordance and discarding settings.
 *
 * Pinning `type="button"` here means the close control will never act
 * as an accidental submit button, regardless of how the surrounding
 * markup evolves.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-modal-close-type-fixture";
  const TEST_TITLE = "Settings Modal Close Type Fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for settings modal close button type attribute test.",
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

describe("PlayPage settings modal close button type attribute (W1315)", () => {
  it("the close button has explicit type='button'", async () => {
    await mountPlaying();

    fireEvent.click(screen.getByTestId("play-settings-btn"));

    const closeBtn = screen.getByTestId("play-settings-close");
    expect(closeBtn.tagName).toBe("BUTTON");
    expect(closeBtn.getAttribute("type")).toBe("button");
  });
});

void React;
