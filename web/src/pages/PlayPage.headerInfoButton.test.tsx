/**
 * Unit test for the PlayPage header info button UI contract (W900).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1674) renders a `<button data-testid="play-info-btn">`
 *   inside the `.play-header-titlerow`. It is a `type="button"` (so a stray
 *   wrapping form can never submit), it carries an aria-label of
 *   "Session info" + `aria-haspopup="dialog"` (announcing the popover
 *   contract to screen readers), and it shows a visible lowercase "i"
 *   glyph. Sibling tests cover the I-hotkey toggle path (W740) and the
 *   popover contents (infoSeedShown, infoSessionCounter, actionLog,
 *   timeTrend), but no test pins the button's *visible UI attributes* —
 *   so a regression that swapped the aria-label for "Info" (drift), set
 *   `type="submit"` (form-bug), or replaced the glyph with an SVG would
 *   slip past every existing test.
 *
 *   This is general PlayPage UX present in every phase (setup, playing,
 *   ended) so we don't need to start the game.
 *
 * Strategy mirrors PlayPage.headerCategoryBadge.test.tsx (W890) and
 * PlayPage.headerTitle.test.tsx (W896):
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId` and locate the button via its testid.
 *   - Pin five static attributes:
 *       1. tagName === BUTTON  (not <a>, not <div role="button">).
 *       2. type === "button"   (so a future form wrapper can't submit).
 *       3. aria-label === "Session info" (screen-reader contract).
 *       4. aria-haspopup === "dialog" (announces popover semantics).
 *       5. textContent.trim() === "i" (visible glyph contract).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-info-btn-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Info Button Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the header info-button UI test.",
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

describe("PlayPage header info button UI contract (W900)", () => {
  it("renders a <button type='button'> with the 'Session info' a11y label, dialog popup hint, and visible 'i' glyph", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("play-info-btn");

    // Tag-name contract — anchors and div-role-buttons would break
    // browser-native focus + Enter/Space activation.
    expect(btn.tagName).toBe("BUTTON");

    // Explicit type — a missing or "submit" type would let a future
    // ancestor <form> swallow Enter and submit the page.
    expect(btn.getAttribute("type")).toBe("button");

    // Screen-reader contract — the button has no visible text label
    // (just the "i" glyph), so the aria-label *is* the only label.
    expect(btn.getAttribute("aria-label")).toBe("Session info");

    // Popover semantics — announces to AT that activation opens a
    // dialog (the play-info-popover). A regression that dropped this
    // would silently degrade screen-reader UX.
    expect(btn.getAttribute("aria-haspopup")).toBe("dialog");

    // Visible glyph contract — the only sighted-user signal that this
    // is the info button. Swapping for an SVG or different glyph
    // (?, !) would break visual recognition while a11y stayed green.
    expect(btn.textContent?.trim()).toBe("i");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
