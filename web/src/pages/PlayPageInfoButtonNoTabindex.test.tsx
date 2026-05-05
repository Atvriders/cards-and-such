/**
 * Unit test pinning the absence of a `tabindex` attribute on the PlayPage
 * session-info trigger button (W2288).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1674-1686) renders the session-info trigger as
 *     `<button ref={infoButtonRef} type="button" className="play-info-btn"
 *              onClick={...} aria-label="Session info" aria-expanded={infoOpen}
 *              aria-haspopup="dialog" data-testid="play-info-btn"
 *              title="Session info">i</button>`
 *   It deliberately does NOT carry a `tabindex` attribute. As a native
 *   `<button>`, it is keyboard-focusable by default with the natural DOM
 *   tab order. Adding `tabindex="0"` would be redundant and adding
 *   `tabindex="-1"` would silently remove it from the keyboard tab order
 *   — a serious accessibility regression for users who rely on Tab to
 *   reach the session-info popover trigger.
 *
 *   Sibling tests cover OTHER attributes on this same button — class
 *   (PlayPageInfoButtonClass), no-id (PlayPageInfoButtonNoId), no-style
 *   (PlayPageInfoButtonNoStyle), the inner glyph aria
 *   (PlayPageInfoBtnGlyphAria), aria-expanded
 *   (PlayPage.headerInfoAriaExpanded), and tooltip/title bindings — but
 *   NONE assert that the trigger has NO `tabindex` attribute. A
 *   regression that started emitting `tabindex="-1"` (e.g. while taming
 *   focus during popover transitions) would silently break keyboard
 *   navigation and pass every existing test. This single focused
 *   assertion fills that gap.
 *
 *   Note: a separate test (PlayPageInfoPopoverTabIndex) pins the
 *   `tabindex="-1"` on the popover container itself; this test is
 *   strictly about the TRIGGER BUTTON, which is a distinct element.
 *
 * Strategy mirrors PlayPageInfoButtonNoId.test.tsx (W2046):
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Find `play-info-btn` and assert `hasAttribute("tabindex") === false`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-button-no-tabindex-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Button No-Tabindex Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-button no-tabindex test.",
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

describe("PlayPage info button has no `tabindex` attribute (W2288)", () => {
  it("does not emit a `tabindex` attribute on the play-info-btn element", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past setup so the trigger button is mounted on the live
    // playing-phase header — the realistic surface where it lives.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fixture-game")).toBeTruthy();

    // The trigger button must exist but must NOT carry a `tabindex`
    // attribute. A native <button> is focusable by default; any explicit
    // tabindex would be either redundant ("0") or a keyboard-accessibility
    // regression ("-1"). Either case warrants a deliberate code review.
    const btn = screen.getByTestId("play-info-btn");
    expect(btn.hasAttribute("tabindex")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
