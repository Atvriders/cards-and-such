/**
 * Unit test for the PlayPage info popover close-button className — exact
 * equality (W1868).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1771-1781) renders, inside the open session-info
 *   popover, `<button type="button" class="play-info-close" aria-label=
 *   "Close session info">Close</button>`. The element's `className` is the
 *   single literal string `play-info-close` — no companion utility classes,
 *   no conditional modifiers. That single-class contract is what the popover
 *   stylesheet pivots on for hover, focus-ring, and spacing.
 *
 *   Sibling tests already cover:
 *     - W1249 PlayPageInfoPopoverCloseClassName: asserts
 *       `classList.contains("play-info-close")`. That weaker check would
 *       still pass if a regression *added* a sibling class (e.g.
 *       "play-info-close generic-btn-secondary"), silently broadening the
 *       styling surface. Exact equality forecloses that drift.
 *     - W985 PlayPage.infoPopoverCloseAriaLabel: aria-label + visible text.
 *     - PlayPageInfoPopoverCloseType: literal `type="button"`.
 *     - PlayPage.infoPopoverCloseClick: click closes the popover.
 *
 *   None of them pins `closeBtn.className === "play-info-close"` exactly,
 *   which is the strict structural contract this test fills.
 *
 * Strategy mirrors the hoisted-fixture pattern used by neighboring exact-
 * equality className tests (e.g. PlayPageSeedPickerCloseClass W1309):
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Click `play-info-btn` to open the popover.
 *   - Locate close button by aria-label and assert exact className equality.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-close-classname-exact-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Close ClassName Exact Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-popover close className exact-equality test.",
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

describe("PlayPage info popover close button className — exact (W1868)", () => {
  it("close button className equals exactly 'play-info-close' (no extras)", async () => {
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

    // Disambiguate from sibling close controls via the popover's specific
    // accessible name.
    const closeBtn = screen.getByRole("button", { name: "Close session info" });

    // Strict equality — pins the single-class contract. Any rename, drop,
    // or addition of sibling classes will trip this check, where the
    // existing classList.contains assertion would not.
    expect(closeBtn.className).toBe("play-info-close");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
