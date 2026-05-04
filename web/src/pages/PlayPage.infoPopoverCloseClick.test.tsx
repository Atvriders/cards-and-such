/**
 * Unit test for the PlayPage info popover close-button click behavior (W1005).
 *
 * Observable behavior:
 *   PlayPage.tsx renders a close affordance inside the open session-info
 *   popover with `aria-label="Close session info"`. Clicking that button
 *   must dismiss the popover (i.e. unmount the `play-info-popover`
 *   surface). W985 already pins the accessible-name contract of the close
 *   button, but no sibling test exercises the click action itself —
 *   leaving the dismiss handler entirely unguarded. A regression that
 *   detached the click handler, set the wrong state setter, or re-opened
 *   the popover synchronously after close would let the visible UI
 *   *appear* identical at rest while the close button silently became a
 *   no-op for both AT and sighted users.
 *
 * Strategy mirrors PlayPage.infoPopoverCloseAriaLabel.test.tsx (W985):
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Click `play-info-btn` to open the popover; assert it mounted.
 *   - Locate the close button by its `aria-label="Close session info"`
 *     accessible name, click it, and assert the popover unmounts.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-close-click-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Close Click Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-popover close click test.",
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

describe("PlayPage info popover close button click (W1005)", () => {
  it("clicking the close button unmounts the info popover", async () => {
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

    // Open the popover and confirm it mounted so the click target is
    // actually the live surface (not a stale retained reference).
    fireEvent.click(screen.getByTestId("play-info-btn"));
    expect(screen.getByTestId("play-info-popover")).toBeTruthy();

    // Locate the close button by its explicit accessible name (W985's
    // contract). Using getByRole here doubles as a sanity probe — if the
    // aria-label regressed simultaneously, this lookup would itself fail
    // before the click action.
    const closeBtn = screen.getByRole("button", { name: "Close session info" });

    // The action under test: clicking the close button must dismiss the
    // popover.
    fireEvent.click(closeBtn);

    // Popover must be gone from the DOM. queryByTestId returns null when
    // the element is unmounted, which is the strongest assertion of
    // dismissal — stronger than e.g. checking a hidden attribute, since
    // the popover is conditionally rendered, not just visually hidden.
    expect(screen.queryByTestId("play-info-popover")).toBeNull();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
