/**
 * Unit test for PlayPage settings modal title text suffix (W1363).
 *
 * Sibling tests already lock the title element's tag (`<h2>`), its class
 * `play-settings-modal-title`, and assert the visible text contains the
 * plugin's title (W1015). None of them assert the literal trailing
 * " settings" word — without it the heading would just be the bare
 * plugin name and users would lose the cue about *what* surface they're
 * looking at.
 *
 * This test pins the contract:
 *
 *   - The `<h2>.play-settings-modal-title` text equals exactly
 *     `${plugin.title} settings` (i.e. ends with the lowercase word
 *     " settings"), so a refactor that dropped or rephrased the suffix
 *     (e.g. "Settings", "Options", "") would fail loudly instead of
 *     silently shipping a less helpful heading.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-modal-title-suffix-fixture";
  const TEST_TITLE = "Settings Modal Title Suffix Fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for settings modal title suffix test.",
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

describe("PlayPage settings modal title text suffix (W1363)", () => {
  it("the title h2 text equals `${plugin.title} settings`", async () => {
    await mountPlaying();

    fireEvent.click(screen.getByTestId("play-settings-btn"));

    const modal = screen.getByTestId("play-settings-modal");
    const titleEl = modal.querySelector(".play-settings-modal-title");
    expect(titleEl).toBeTruthy();
    // Exact match — locks the trailing " settings" word and prevents the
    // heading from drifting to just the plugin name or a different suffix.
    expect(titleEl!.textContent).toBe(`${hoisted.TEST_TITLE} settings`);
  });
});

void React;
