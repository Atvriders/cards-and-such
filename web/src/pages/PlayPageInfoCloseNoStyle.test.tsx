/**
 * Unit test for the PlayPage info popover close button — absence of an
 * inline `style` attribute (W2155).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1771-1781) renders, inside the open session-info
 *   popover, `<button type="button" class="play-info-close" aria-label=
 *   "Close session info">Close</button>`. The JSX deliberately omits any
 *   `style={...}` prop — all visual treatment (colors, spacing, focus
 *   ring, hover states) is delegated to the `play-info-close` CSS class
 *   via PlayPage.css. Inline styles would override the stylesheet's
 *   theme-aware rules and break the layered styling contract.
 *
 *   Sibling tests already pin:
 *     - W1868 PlayPageInfoCloseButtonClass: exact className equality.
 *     - W1249 PlayPageInfoPopoverCloseClassName: classList.contains.
 *     - W985 PlayPage.infoPopoverCloseAriaLabel: aria-label + text.
 *     - PlayPageInfoPopoverCloseType: literal `type="button"`.
 *     - PlayPageInfoCloseNoId: absence of an `id` attribute.
 *
 *   None of them assert that the rendered DOM node carries no `style`
 *   attribute. A regression that introduces inline styling (e.g. a
 *   `style={{ display: ... }}` prop wired to ad-hoc layout state) would
 *   silently bypass the CSS contract; this test forecloses that drift
 *   by asserting `btn.hasAttribute("style") === false`.
 *
 * Strategy mirrors the hoisted-fixture pattern used by neighboring
 * PlayPage popover tests (e.g. PlayPageInfoCloseButtonClass W1868):
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Click `play-info-btn` to open the popover.
 *   - Locate close button by its unique accessible name and assert no
 *     `style` attribute is present.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-close-no-style-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Close No Style Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-popover close no-style test.",
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

describe("PlayPage info popover close button — no inline style (W2155)", () => {
  it("close button has no `style` attribute on the rendered DOM node", async () => {
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

    // The styling contract: zero inline styles, all visual treatment
    // delegated to the `play-info-close` CSS class.
    expect(closeBtn.hasAttribute("style")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
