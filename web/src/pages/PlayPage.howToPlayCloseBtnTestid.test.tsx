/**
 * Unit test for PlayPage how-to-play modal close-button testid + a11y (W1001).
 *
 * Builds on W989 (modal role/aria-labelledby) and W1000 (Escape closes). Those
 * tests verify the dialog mounts with the right ARIA contract and that the
 * keyboard-escape path runs `onClose`. This test pins one of the remaining
 * untested a11y aspects:
 *
 *   - The close (X) button inside the HowToPlayModal exposes the stable
 *     `data-testid="htp-close"` selector that downstream tests / e2e checks
 *     reach for, AND it carries an accessible name (`aria-label="Close"`)
 *     because the visible affordance is an icon-only SVG.
 *   - Activating that button removes the dialog from the DOM (or at least
 *     transitions it into the closing state), confirming the testid is wired
 *     to the same `onClose` path that the Escape key uses.
 *
 * Strategy:
 *   - `vi.hoisted` builds a fixture plugin with a non-empty `howToPlay`
 *     string and no `tutorialSteps`, so the toolbar `help-btn` opens the
 *     HowToPlayModal (and not the tutorial overlay).
 *   - The plugin is mocked into `../games/registry.js` so PlayPage resolves
 *     it without touching the real registry.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "howtoplay-close-btn-testid-fixture";
  const TITLE = "How To Play Close Btn Fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for how-to-play modal close-button test.",
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

describe("PlayPage how-to-play modal close button testid + a11y (W1001)", () => {
  it("the htp-close button has aria-label='Close' and clicking it dismisses the modal", async () => {
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

    // The close (X) button must be findable by its stable testid and must
    // expose an accessible name — its visible affordance is an icon-only
    // SVG, so screen readers depend on aria-label here.
    const closeBtn = screen.getByTestId("htp-close") as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    expect(closeBtn.tagName).toBe("BUTTON");
    expect(closeBtn.getAttribute("aria-label")).toBe("Close");

    // Clicking the close button must run the same onClose path as Escape.
    fireEvent.click(closeBtn);

    // Either the modal is gone, or it's in its is-closing transition state.
    // (The close animation runs on a timeout, so both outcomes are valid
    // immediately after the click; what matters is that onClose fired.)
    const modalAfter = screen.queryByTestId("htp-modal");
    if (modalAfter) {
      expect(modalAfter.className).toContain("is-closing");
    } else {
      expect(modalAfter).toBeNull();
    }
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
