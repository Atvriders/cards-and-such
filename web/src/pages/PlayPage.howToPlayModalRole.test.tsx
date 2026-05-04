/**
 * Unit test for PlayPage how-to-play modal a11y role/aria attributes (W989).
 *
 * Verifies that when the in-game `help-btn` opens the HowToPlayModal, the
 * mounted dialog element exposes the correct ARIA dialog contract:
 *   - role="dialog"
 *   - aria-modal="true"
 *   - aria-labelledby pointing at an element that exists in the DOM and
 *     contains the plugin's title (so screen readers announce a name).
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
  const TEST_GAME_ID = "howtoplay-modal-role-fixture";
  const TITLE = "How To Play Role Fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for how-to-play modal role/aria tests.",
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

describe("PlayPage how-to-play modal a11y role/aria (W989)", () => {
  it("the opened HowToPlayModal element exposes role=dialog, aria-modal=true, and aria-labelledby pointing at the title", async () => {
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

    const modal = screen.getByTestId("htp-modal");
    expect(modal).toBeTruthy();

    // Core dialog contract.
    expect(modal.getAttribute("role")).toBe("dialog");
    expect(modal.getAttribute("aria-modal")).toBe("true");

    // aria-labelledby must reference an element that exists and contains the
    // plugin's title so the dialog has an accessible name.
    const labelledBy = modal.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    const labelEl = document.getElementById(labelledBy as string);
    expect(labelEl).toBeTruthy();
    expect(labelEl!.textContent).toContain(hoisted.TITLE);
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
