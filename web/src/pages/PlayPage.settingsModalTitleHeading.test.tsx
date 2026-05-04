/**
 * Unit test for PlayPage settings modal title heading element (W1015).
 *
 * Sibling tests cover the settings dialog's `role`/`aria-modal`/`aria-label`
 * (W988/W997) and tabIndex (W757), but none of them inspect the visible
 * title element inside the modal header. This test locks that contract:
 *
 *   - The element with class `play-settings-modal-title` is an `<h2>` tag
 *     so screen-reader heading navigation lands on it and the document
 *     outline stays sane (rather than an arbitrary div/span).
 *   - Its visible text contains the plugin's title, so sighted users see
 *     *which* game's settings they are editing.
 *
 * Without this assertion, a refactor that downgraded the heading to a
 * styled <div> or dropped the plugin title from the header would slip
 * past the existing aria-label-only checks.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-modal-title-heading-fixture";
  const TEST_TITLE = "Settings Modal Title Heading Fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for settings modal title heading test.",
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

describe("PlayPage settings modal title heading element (W1015)", () => {
  it("the settings modal title is an <h2> whose text contains the plugin title", async () => {
    await mountPlaying();

    fireEvent.click(screen.getByTestId("play-settings-btn"));

    // Sanity-check the modal is mounted before inspecting its header.
    const modal = screen.getByTestId("play-settings-modal");
    const titleEl = modal.querySelector(".play-settings-modal-title");
    expect(titleEl).toBeTruthy();
    expect(titleEl!.tagName).toBe("H2");
    expect(titleEl!.textContent).toContain(hoisted.TEST_TITLE);
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
