/**
 * Unit test for PlayPage how-to-play modal focus management on open (W1008).
 *
 * Builds on W589/W685/W691 (content), W989 (role/aria-modal/aria-labelledby),
 * W999 (title heading), W1000 (Esc close), and the close-button tests. This
 * test verifies one of the modal's untested *accessibility* behaviors:
 *
 *   - When the HowToPlayModal opens, focus moves into the dialog (either to
 *     the first focusable element inside it or to the dialog itself as a
 *     tabIndex={-1} fallback). After the focus-management effect runs,
 *     `htp-modal.contains(document.activeElement)` is true.
 *
 * The focus effect runs after the modal mounts (see HowToPlayModal.tsx
 * useEffect on `[mounted, open, onClose]`). React Testing Library's `render`
 * flushes mount-phase effects synchronously, so the assertion can be made
 * immediately after opening the modal.
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
  const TEST_GAME_ID = "howtoplay-focus-fixture";
  const TITLE = "How To Play Focus Fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for how-to-play modal focus-on-open test.",
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

describe("PlayPage how-to-play modal focus on open (W1008)", () => {
  it("moves focus into the dialog when the HowToPlayModal opens", async () => {
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

    // The focus-management effect picks the first focusable element inside
    // the dialog and focuses it (or falls back to the dialog itself, which
    // is rendered with tabIndex={-1}). Either way, document.activeElement
    // should now live inside htp-modal.
    const active = document.activeElement as HTMLElement | null;
    expect(active).not.toBeNull();
    expect(modal.contains(active)).toBe(true);
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
