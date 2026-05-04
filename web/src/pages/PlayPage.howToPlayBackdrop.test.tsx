/**
 * Unit test for PlayPage how-to-play modal backdrop-click dismissal (W1007).
 *
 * Builds on W589/W685/W691 (content), W989 (role/aria-modal/aria-labelledby),
 * W999 (title heading), and W1000 (Escape close). Those tests verify the
 * modal mounts and is accessible; this test verifies a separate untested
 * *interaction*:
 *
 *   - Clicking the modal backdrop (the area outside the dialog) invokes
 *     `onClose`, removing the dialog from the DOM.
 *
 * The backdrop is the outer `.htp-backdrop` wrapper (data-testid
 * `htp-backdrop`) which has `onClick={onClose}`. The inner `.htp-modal`
 * stops propagation, so this test confirms a real backdrop click — not a
 * click that bubbled out of the dialog content — closes the modal.
 *
 * Strategy mirrors PlayPage.howToPlayEscClose.test.tsx:
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
  const TEST_GAME_ID = "howtoplay-backdrop-fixture";
  const TITLE = "How To Play Backdrop Fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for how-to-play modal backdrop-close test.",
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

describe("PlayPage how-to-play modal backdrop closes (W1007)", () => {
  it("clicking the htp-backdrop while the HowToPlayModal is open closes it (htp-modal unmounts or enters closing state)", async () => {
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

    // Click the backdrop (the wrapper around the dialog). The onClick
    // handler on `.htp-backdrop` invokes `onClose`; the inner `.htp-modal`
    // stops propagation, so a click directly on the backdrop is the only
    // path that triggers this dismissal.
    fireEvent.click(screen.getByTestId("htp-backdrop"));

    // After onClose runs, PlayPage flips its open prop to false. The modal
    // either fully unmounts or enters its closing animation state — both
    // are acceptable signals that the backdrop click was wired through.
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
