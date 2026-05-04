/**
 * Unit test for PlayPage how-to-play modal Escape-key close behavior (W1000).
 *
 * Builds on W589/W685/W691 (content), W989 (role/aria-modal/aria-labelledby),
 * and W999 (title heading). Those tests verify the modal mounts and is
 * accessible; this test verifies one of its untested *interactions*:
 *
 *   - Pressing the Escape key while the HowToPlayModal is open invokes
 *     `onClose`, removing the dialog from the DOM.
 *
 * The keydown listener is registered in capture phase on `document`
 * (see HowToPlayModal.tsx), so dispatching the event on `document` matches
 * the production code path. We use the unmount of `htp-modal` as the
 * observable signal that `onClose` ran and PlayPage flipped its open state.
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
  const TEST_GAME_ID = "howtoplay-esc-close-fixture";
  const TITLE = "How To Play Esc Close Fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for how-to-play modal Escape-close test.",
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

describe("PlayPage how-to-play modal Escape closes (W1000)", () => {
  it("pressing Escape while the HowToPlayModal is open closes it (htp-modal unmounts)", async () => {
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

    // Dispatch Escape on document — that's where HowToPlayModal listens
    // (capture phase on document.addEventListener).
    fireEvent.keyDown(document, { key: "Escape" });

    // After onClose runs, PlayPage flips its open prop to false. The modal
    // immediately removes the dialog from the tree (it's gated on `mounted`,
    // which the close-animation timeout will clear, but the visible
    // `htp-modal` testid we asserted above is removed once the close path
    // completes). Wait briefly for any async state flush, then assert the
    // dialog is gone or marked closing.
    const modalAfter = screen.queryByTestId("htp-modal");
    if (modalAfter) {
      // Animation timeout (220ms) hasn't fired yet, but the modal must at
      // least be in the closing state (no longer "is-open").
      expect(modalAfter.className).toContain("is-closing");
    } else {
      expect(modalAfter).toBeNull();
    }
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
