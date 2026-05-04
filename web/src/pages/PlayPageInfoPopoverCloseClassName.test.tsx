/**
 * Unit test for the PlayPage info popover close-button className (W1249).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1771-1781) renders, inside the open session-info
 *   popover, a `<button class="play-info-close" aria-label="Close session
 *   info">Close</button>`. The literal `play-info-close` class is the CSS
 *   contract that styles the button distinctly from sibling close controls
 *   (settings modal close, banner dismiss, etc.) so a regression that
 *   renamed the class, dropped it, or merged it into a generic class would
 *   silently break the popover's visual styling while leaving every other
 *   contract (role/aria-label/text) intact.
 *
 *   Sibling tests cover:
 *     - W985 infoPopoverCloseAriaLabel: aria-label="Close session info" and
 *       visible "Close" text — does NOT inspect the className.
 *     - W984 infoPopoverRole: the popover element's role="dialog".
 *     - infoPopoverCloseClick: click behavior, not styling class.
 *
 *   None of them assert the close button's `play-info-close` class, leaving
 *   the CSS-styling contract unpinned.
 *
 * Strategy mirrors PlayPage.infoPopoverCloseAriaLabel.test.tsx (W985):
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Click `play-info-btn` to open the popover.
 *   - Find the close button by accessible name and assert its className
 *     contains `play-info-close` exactly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-close-classname-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Close ClassName Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-popover close className test.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// render side-effect-free.
vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage info popover close button className (W1249)", () => {
  it("the in-popover close button carries the literal 'play-info-close' class", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fixture-game")).toBeTruthy();

    // Open the popover so the close button mounts on the live surface.
    fireEvent.click(screen.getByTestId("play-info-btn"));

    const popover = screen.getByTestId("play-info-popover");
    expect(popover).toBeTruthy();

    // Locate the close button via its specific accessible name (the only
    // signal that disambiguates it from sibling close controls).
    const closeBtn = screen.getByRole("button", { name: "Close session info" });

    // Pin the literal class — guards against a rename, removal, or merge
    // into a generic shared class that would silently regress styling.
    expect(closeBtn.classList.contains("play-info-close")).toBe(true);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
