/**
 * Unit test for PlayPage how-to-play modal Print button `title` attribute (W1276).
 *
 * Builds on W1001 (close button testid + a11y), W989 (modal role/aria), and
 * W999 (title heading). Those tests pin the dialog's modal contract and the
 * close affordance, but none of them cover the *Print* icon-button that sits
 * next to the close (X) in the modal header.
 *
 * The Print button is icon-only — its visible affordance is an SVG, so it
 * relies on two non-visual attributes for usability:
 *
 *   - `aria-label="Print"` — the screen-reader name.
 *   - `title="Print"`     — the hover-tooltip name a sighted mouse user gets.
 *
 * This test pins the `title="Print"` attribute (which no other test
 * currently covers — the existing PlayPage Print-button tests are scoped to
 * the end-of-game *banner* Print button, not the HowToPlay header one).
 *
 * Strategy:
 *   - `vi.hoisted` builds a fixture plugin with a non-empty `howToPlay`
 *     string and no `tutorialSteps`, so the toolbar `help-btn` opens the
 *     HowToPlayModal (not the tutorial overlay).
 *   - The plugin is mocked into `../games/registry.js` so PlayPage resolves
 *     it without touching the real registry.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "howtoplay-print-title-fixture";
  const TITLE = "How To Play Print Title Fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for how-to-play modal Print button title test.",
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

describe("PlayPage how-to-play modal Print button title (W1276)", () => {
  it("the htp-print button exposes title='Print' as a hover-tooltip name", async () => {
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
    expect(screen.getByTestId("htp-modal")).toBeTruthy();

    // The Print icon button must carry a hover-tooltip name. The visible
    // affordance is an icon-only SVG, so sighted mouse users rely on the
    // `title` attribute to discover what the button does.
    const printBtn = screen.getByTestId("htp-print") as HTMLButtonElement;
    expect(printBtn).toBeTruthy();
    expect(printBtn.tagName).toBe("BUTTON");
    expect(printBtn.getAttribute("title")).toBe("Print");
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
