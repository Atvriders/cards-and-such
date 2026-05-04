/**
 * Unit test for PlayPage how-to-play modal close-button (×) click behavior (W1006).
 *
 * Builds on W589/W685/W691 (content), W989 (role/aria-modal/aria-labelledby),
 * W999 (title heading), and W1000 (Esc-key close). Those tests verify the
 * modal mounts and is accessible; this test verifies another of its untested
 * *interactions*:
 *
 *   - Clicking the header close button (×) while the HowToPlayModal is open
 *     invokes `onClose`, removing the dialog from the DOM (or transitioning
 *     it into the is-closing state).
 *
 * The close button is rendered in HowToPlayModal.tsx with
 * `data-testid="htp-close"` and `aria-label="Close"`. We use the unmount /
 * is-closing transition of `htp-modal` as the observable signal that
 * `onClose` ran and PlayPage flipped its open state.
 *
 * Strategy:
 *   - `vi.hoisted` builds a fixture plugin with a non-empty `howToPlay`
 *     string and no `tutorialSteps`, so the help button routes to the
 *     HowToPlayModal (not the tutorial overlay).
 *   - The plugin is mocked into `../games/registry.js` so PlayPage resolves
 *     it without touching the real registry.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "howtoplay-close-button-fixture";
  const TITLE = "How To Play Close Button Fixture";
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

describe("PlayPage how-to-play modal close-button click (W1006)", () => {
  it("clicking the close (×) button while the HowToPlayModal is open closes it (htp-modal unmounts)", async () => {
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

    // Locate the close button by its testid and confirm aria-label is
    // the accessible "Close" label production users see.
    const closeBtn = screen.getByTestId("htp-close");
    expect(closeBtn.getAttribute("aria-label")).toBe("Close");

    // Click it — that fires the modal's onClose, which PlayPage handles by
    // flipping the open prop to false.
    fireEvent.click(closeBtn);

    // After onClose runs, PlayPage flips its open prop to false. The modal
    // gates final unmount on a 220ms close-animation timeout, but as soon
    // as the close path runs the modal must either be unmounted or marked
    // is-closing.
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
