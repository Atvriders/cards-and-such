/**
 * Unit test for PlayPage how-to-play title heading element (W999).
 *
 * Sibling to W989's role/aria-attributes test. While that test verifies the
 * *dialog* exposes `aria-labelledby="htp-title"`, this test verifies the
 * *target* of that pointer is itself a well-formed labelling element:
 *   - It is an `<h2>` tag (not an arbitrary div), so screen-reader heading
 *     navigation lands on it and the document outline stays sane.
 *   - Its `id` is exactly `htp-title`, matching the modal's
 *     `aria-labelledby`.
 *   - Its visible text contains the plugin's title, so the announced
 *     accessible name is meaningful.
 *
 * Strategy:
 *   - `vi.hoisted` builds a fixture plugin with a non-empty `howToPlay`
 *     string and no `tutorialSteps`, so the help button routes to the
 *     HowToPlayModal (not the tutorial overlay).
 *   - The plugin is mocked into `../games/registry.js` so PlayPage
 *     resolves it without touching the real registry.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "howtoplay-title-heading-fixture";
  const TITLE = "How To Play Title Heading Fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for how-to-play title heading test.",
    settings: {} as Record<string, never>,
    howToPlay: "Goal: win the game.\n\nMove cards onto foundations.",
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, TITLE, fixturePlugin };
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

describe("PlayPage how-to-play title heading element (W999)", () => {
  it("the htp-title element is an <h2> with id 'htp-title' and text containing the plugin title", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so the in-game toolbar mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the modal via the toolbar help button.
    fireEvent.click(screen.getByTestId("help-btn"));

    // Locate the labelling element directly by its id (the same id
    // referenced by the dialog's aria-labelledby).
    const titleEl = document.getElementById("htp-title");
    expect(titleEl).toBeTruthy();
    expect(titleEl!.tagName).toBe("H2");
    expect(titleEl!.id).toBe("htp-title");
    expect(titleEl!.textContent).toContain(hoisted.TITLE);
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
