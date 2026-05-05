/**
 * Unit test for the PlayPage info popover close button — absence of a
 * `tabindex` attribute (W2294).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1771-1781) renders, inside the open session-info
 *   popover, `<button type="button" class="play-info-close" aria-label=
 *   "Close session info">Close</button>`. The JSX deliberately omits any
 *   `tabIndex` prop. Native `<button>` elements are already focusable in
 *   the document's natural tab order; layering a `tabindex` (whether `0`,
 *   a positive integer, or `-1`) only introduces tab-order regressions:
 *   `0` is redundant noise, positive values warp the global sequence,
 *   and `-1` removes the close affordance from keyboard users entirely.
 *
 *   Sibling tests already pin:
 *     - W1868 PlayPageInfoCloseButtonClass: exact className equality.
 *     - W1249 PlayPageInfoPopoverCloseClassName: classList.contains.
 *     - W985  PlayPage.infoPopoverCloseAriaLabel: aria-label + text.
 *     - PlayPageInfoPopoverCloseType: literal `type="button"`.
 *     - PlayPageInfoCloseNoId: absence of an `id` attribute.
 *     - W2155 PlayPageInfoCloseNoStyle: absence of inline `style`.
 *
 *   None of them assert that the rendered DOM node carries no `tabindex`
 *   attribute. A regression that wires `tabIndex={...}` onto the button
 *   would silently break the keyboard-navigation contract; this test
 *   forecloses that drift by asserting
 *   `btn.hasAttribute("tabindex") === false`.
 *
 * Strategy mirrors the hoisted-fixture pattern used by neighboring
 * PlayPage popover tests (e.g. PlayPageInfoCloseNoStyle W2155):
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Click `play-info-btn` to open the popover.
 *   - Locate close button by its unique accessible name and assert no
 *     `tabindex` attribute is present.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-close-no-tabindex-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Close No Tabindex Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-popover close no-tabindex test.",
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

describe("PlayPage info popover close button — no `tabindex` attribute (W2294)", () => {
  it("close button has no `tabindex` attribute on the rendered DOM node", async () => {
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

    // The keyboard-navigation contract: a native <button> is already
    // focusable in document order — no `tabindex` override should appear.
    expect(closeBtn.hasAttribute("tabindex")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
