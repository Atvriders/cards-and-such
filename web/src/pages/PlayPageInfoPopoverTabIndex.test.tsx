/**
 * Unit test for the PlayPage info popover tabIndex=-1 attribute (W1419).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1689-1695) renders the session-info popover as
 *   `<div data-testid="play-info-popover" role="dialog" aria-modal="true"
 *   aria-label="Session info" tabIndex={-1}>` whenever `infoOpen` is true.
 *   The `tabIndex={-1}` is the "container fallback focus target" the
 *   focus-trap relies on when the popover happens to mount with no inner
 *   focusable descendant: the trap calls `.focus()` on the container
 *   itself, which is only honoured by browsers when `tabindex` is set to
 *   a negative integer (programmatic focus only, not in tab order).
 *
 *   Sibling tests cover related popover attributes:
 *     - W984 infoPopoverRole: role="dialog" on the same element.
 *     - infoPopoverAriaModal / infoPopoverAriaLabel: aria-* attributes.
 *     - infoPopoverFocus: behavioural focus-trap test that relies on the
 *       container being focusable but never asserts the attribute itself
 *       (only checks where `document.activeElement` ends up).
 *
 *   None of them pin `tabindex="-1"` on the popover element. A regression
 *   that dropped the prop, set it to a positive value (which would inject
 *   the popover container into the page tab order), or omitted the
 *   attribute entirely (getAttribute -> null, leaving the container
 *   unfocusable) would silently break the focus-trap fallback path.
 *
 * Strategy mirrors PlayPage.infoPopoverRole.test.tsx:
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Click `play-info-btn` to open the popover.
 *   - Find `play-info-popover` and assert tabindex="-1" exactly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-tabindex-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover TabIndex Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-popover tabIndex=-1 test.",
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

describe("PlayPage info popover tabIndex=-1 (W1419)", () => {
  it("exposes tabindex=\"-1\" on the play-info-popover element when opened", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past setup so we exercise the popover on the live
    // playing-phase header — the realistic surface where the focus-trap
    // fallback (tabIndex=-1 container focus) actually fires.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fixture-game")).toBeTruthy();

    // Open the popover.
    fireEvent.click(screen.getByTestId("play-info-btn"));

    // The popover must now exist and carry tabindex="-1" exactly. A
    // regression that dropped the attribute (-> null, container
    // unfocusable) or set it to "0"+ (container injected into the page
    // tab order) would fail this assertion.
    const popover = screen.getByTestId("play-info-popover");
    expect(popover.getAttribute("tabindex")).toBe("-1");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
