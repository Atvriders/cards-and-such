/**
 * Unit test for the PlayPage header info button aria-expanded toggle (W975).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1674) renders a `<button data-testid="play-info-btn">`
 *   that opens/closes the session-info popover. The button declares
 *   `aria-haspopup="dialog"` (static, pinned by W900) AND a *dynamic*
 *   `aria-expanded={infoOpen}` that flips between "false" (popover closed)
 *   and "true" (popover open). The dynamic value is the screen-reader's
 *   only signal that activating the button changed disclosure state — a
 *   regression that hard-coded `aria-expanded={false}`, dropped the
 *   attribute, or wired it to the wrong state variable would silently
 *   break disclosure semantics for AT users while sighted users still
 *   saw the popover open and close.
 *
 *   Sibling tests cover:
 *     - W900 headerInfoButton: static UI contract (tag, type, aria-label,
 *       aria-haspopup, glyph) — does NOT exercise aria-expanded.
 *     - W969 headerInfoKeyshortcuts: absence of aria-keyshortcuts.
 *     - W740 I-hotkey: window-level toggle path (functional, not ARIA).
 *     - actionLog / infoSeedShown / etc.: popover *contents* once open.
 *
 *   None of them assert that aria-expanded *toggles* with the popover
 *   state, leaving the disclosure-semantics contract unpinned.
 *
 * Strategy mirrors PlayPage.actionLog.test.tsx:
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase
 *     (matches the W740 / actionLog convention even though the info
 *     button is also reachable in setup; staying consistent with
 *     "advance to playing" keeps the disclosure path identical to how a
 *     real user would encounter it mid-session).
 *   - Read aria-expanded BEFORE click — must be "false".
 *   - Click `play-info-btn`.
 *   - Read aria-expanded AFTER click — must be "true". Also assert the
 *     popover actually mounted, so a future bug that toggled the ARIA
 *     attribute without rendering the dialog would still fail loudly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-info-aria-expanded-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Info Aria-Expanded Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-button aria-expanded test.",
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

describe("PlayPage header info button aria-expanded toggle (W975)", () => {
  it("flips aria-expanded from 'false' to 'true' when the info popover opens", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past setup so we are exercising the disclosure semantics on
    // the live playing-phase header — the most realistic surface for the
    // aria-expanded contract that AT users will encounter mid-session.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fixture-game")).toBeTruthy();

    const btn = screen.getByTestId("play-info-btn");

    // Before click: popover is closed, screen readers must hear
    // "collapsed" via aria-expanded="false". A regression that dropped
    // the attribute (getAttribute -> null) or hard-coded "true" would
    // fail this assertion.
    expect(btn.getAttribute("aria-expanded")).toBe("false");

    // Open the popover.
    fireEvent.click(btn);

    // After click: popover is open, aria-expanded MUST flip to "true".
    // We re-read from the same element reference; React updates the live
    // attribute in place when the bound state changes.
    expect(btn.getAttribute("aria-expanded")).toBe("true");

    // Belt-and-braces: confirm the popover actually mounted, so a future
    // regression that *only* flipped the ARIA value without rendering
    // the dialog would still surface here rather than silently passing.
    expect(screen.getByTestId("play-info-popover")).toBeTruthy();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
