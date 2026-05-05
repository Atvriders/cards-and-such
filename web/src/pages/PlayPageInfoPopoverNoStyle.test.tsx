/**
 * Unit test for the PlayPage info popover NOT carrying an inline `style`
 * attribute (W2107).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1687-1696) renders the session-info popover as
 *   `<div className="play-info-popover" role="dialog" aria-modal="true"
 *   aria-label="Session info" data-testid="play-info-popover"
 *   tabIndex={-1}>`. Note the JSX includes NO `style={...}` prop — all
 *   visual presentation (positioning, sizing, padding, background, etc.)
 *   is owned by the `play-info-popover` CSS class. The popover element
 *   itself is intentionally style-attribute-free so designers can change
 *   look without touching the component, and so server/AT introspection
 *   sees a clean dialog node.
 *
 *   Sibling tests pin the POSITIVE attributes:
 *     - W1465 wrapper className "play-info-popover"
 *     - W984  role="dialog"
 *     - W990  aria-modal="true"
 *     - aria-label="Session info"
 *     - W1419 tabIndex=-1
 *     - W1472 NO aria-describedby
 *   And many sibling tests assert inline `style` on the popover's
 *   CHILDREN (action-log <ol>, <li>, <code>, etc. — see
 *   PlayPageInfoActionLog*FontSize/Margin/Padding/Flex/etc. tests). None
 *   assert the absence of `style` on the popover ELEMENT itself.
 *
 *   A regression that added an inline `style={{...}}` prop to the
 *   popover wrapper (e.g. a stray `style={{ display: "block" }}` debug
 *   crumb, or a hard-coded `style={{ width: 320 }}` that defeats the
 *   class) would survive every existing assertion: className, role,
 *   aria-modal, aria-label, tabIndex, and even the children-style tests
 *   would all still pass while the popover silently carried inline
 *   overrides. This test pins the documented contract that the popover
 *   wrapper carries NO inline style attribute.
 *
 * Strategy mirrors PlayPageInfoPopoverNoAriaDescribedBy.test.tsx (W1472):
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Click `play-info-btn` to open the popover.
 *   - Find `play-info-popover` and assert hasAttribute("style") === false
 *     (attribute literally absent, not present-but-empty).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-no-style-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover No Style Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the info-popover no-inline-style absence test.",
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

describe("PlayPage info popover has no inline style attribute (W2107)", () => {
  it("does not set a style attribute on the play-info-popover element", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past setup so the playing-phase header (with the info
    // trigger) mounts.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fixture-game")).toBeTruthy();

    // Open the popover.
    fireEvent.click(screen.getByTestId("play-info-btn"));

    const popover = screen.getByTestId("play-info-popover");
    // Sanity: the className-driven styling contract is in place. Pinning
    // this here keeps the negative assertion meaningful — if the popover
    // ever migrates from a class-driven style to inline style, this test
    // should be updated, not silently weakened.
    expect(popover.className).toBe("play-info-popover");
    // The contract: NO inline `style` attribute is rendered on the
    // popover wrapper. A regression that added a `style={{...}}` prop
    // (even one with no rules in production) would fail here.
    expect(popover.hasAttribute("style")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
