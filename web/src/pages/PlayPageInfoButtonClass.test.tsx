/**
 * Unit test pinning the PlayPage info-button `className` exactly (W1877).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1674) renders the session-info trigger as
 *   `<button data-testid="play-info-btn" className="play-info-btn" ...>`.
 *   The class is the only hook that PlayPage.css uses to style the
 *   button (size, glyph color, hover/focus rings) — if a refactor
 *   inlined the styles, renamed the class, or merged it with another
 *   utility class, the visual treatment regresses while every existing
 *   sibling test (a11y label, aria-haspopup, glyph, type, aria-expanded,
 *   keyshortcuts, title, headerInfoButton) stays green because none of
 *   them inspect `className`.
 *
 *   Existing tests cover the popover-close button class
 *   (PlayPageInfoCloseButtonClass), the popover-wrapper class
 *   (PlayPageInfoPopoverWrapperClassName), and structural attributes
 *   of the trigger — but the trigger button's own className was an
 *   uncovered seam. This test pins the exact string so a single
 *   character of drift is caught.
 *
 *   No game start required: the info button is in the static header
 *   chrome and is rendered in every PlayPage phase.
 *
 * Strategy mirrors PlayPage.headerInfoButton.test.tsx (W900):
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId` and locate the button via its testid.
 *   - Assert `btn.className === "play-info-btn"` with strict equality.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-btn-class-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Button Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-button className test.",
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

describe("PlayPage info button className (W1877)", () => {
  it("uses exactly className='play-info-btn' (no extra utility classes, no rename)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("play-info-btn");

    // Strict equality on .className — the most aggressive form of pin.
    // Catches: rename ("play-info-button"), drop ("" / undefined),
    // additive drift ("play-info-btn icon-btn"), and ordering changes
    // (e.g. " play-info-btn" with leading whitespace from a template
    // literal). Anything but the exact string fails.
    expect(btn.className).toBe("play-info-btn");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
