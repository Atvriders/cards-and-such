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

  it("renders the plugin's howToPlay text inside the modal body (W685)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("start-game"));
    fireEvent.click(screen.getByTestId("help-btn"));

    const body = screen.getByTestId("htp-body");
    expect(body).toBeTruthy();
    // The fixture's howToPlay string is:
    //   "Goal: win the game.\n\nMove cards onto foundations."
    // The parser turns "Goal:" into a section heading and emits the rest of
    // the line plus the next paragraph as body content. Both fragments
    // should be visible to the user inside the modal body.
    const bodyText = body.textContent ?? "";
    expect(bodyText).toContain("win the game.");
    expect(bodyText).toContain("Move cards onto foundations.");
  });

  it("hides the help-btn and never mounts HowToPlayModal when howToPlay is undefined (W691)", async () => {
    // Re-mock the registry with a plugin that has NO howToPlay field. This
    // covers the missing-text fallback branch: PlayPage gates both the
    // toolbar `help-btn` and the `HowToPlayModal` mount on
    // `plugin.howToPlay` being truthy (and `tutorialFor` returns undefined
    // for an unknown plugin id), so the fallback is "no help affordance".
    vi.resetModules();
    const TEST_GAME_ID_MISSING = "howtoplay-fixture-missing";
    const fixturePluginNoHowTo = {
      id: TEST_GAME_ID_MISSING,
      title: "How To Play Fixture (Missing)",
      category: "cards" as const,
      players: { min: 1, max: 1, multiplayer: false },
      description: "Test-only plugin with no howToPlay field.",
      settings: {} as Record<string, never>,
      // howToPlay intentionally omitted
      initialState: () => ({ moves: 0 }),
      reducer: (state: { moves: number }) => state,
      isTerminal: () => null,
      component: () => <div data-testid="fixture-game-missing">game</div>,
    };
    vi.doMock("../games/registry.js", () => ({
      GAMES: [fixturePluginNoHowTo],
    }));

    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${TEST_GAME_ID_MISSING}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so the in-game toolbar mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Without howToPlay (and without registered tutorialSteps for this id),
    // the help button must not be rendered at all.
    expect(screen.queryByTestId("help-btn")).toBeNull();
    // And the HowToPlayModal must never be mounted.
    expect(screen.queryByTestId("htp-modal")).toBeNull();
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
