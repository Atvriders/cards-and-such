/**
 * Unit test for PlayPage how-to-play modal opening (W589).
 *
 * Verifies that clicking the in-game `help-btn` toolbar button:
 *   1. Mounts the HowToPlayModal dialog
 *   2. Renders the modal title containing the plugin's title
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

// ---------------------------------------------------------------------------
// Hoisted fixture so the vi.mock factory below can reference it. vi.hoisted
// runs before the mocked module's imports are evaluated, so the closure is
// safe even though it visually looks like a TDZ violation.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "howtoplay-fixture";
  const TITLE = "How To Play Fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for how-to-play modal tests.",
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

describe("PlayPage how-to-play modal (W589)", () => {
  it("opens HowToPlayModal with title containing the plugin's title when help-btn is clicked", async () => {
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

    // Modal is closed by default — the dialog isn't in the tree yet.
    expect(screen.queryByTestId("htp-modal")).toBeNull();

    fireEvent.click(screen.getByTestId("help-btn"));

    const modal = screen.getByTestId("htp-modal");
    expect(modal).toBeTruthy();
    // The dialog's title element renders the plugin's title.
    const title = document.getElementById("htp-title");
    expect(title).toBeTruthy();
    expect(title!.textContent).toContain(hoisted.TITLE);
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
