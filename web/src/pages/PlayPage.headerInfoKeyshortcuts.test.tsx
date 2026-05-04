/**
 * Unit test for the PlayPage header info button aria-keyshortcuts contract
 * (W969).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1674) renders a `<button data-testid="play-info-btn">`
 *   that toggles the session-info popover. Per W740 the "I" hotkey is
 *   *window-level* — it is registered on the global window keydown
 *   handler (so the popover toggles even when focus is outside the
 *   button). Because the shortcut is not bound to the button itself,
 *   the button MUST NOT advertise `aria-keyshortcuts="i"`: doing so
 *   would mislead screen readers and AT users into believing focus must
 *   be on the button (or that the shortcut is locally scoped to the
 *   button), contradicting the actual window-level binding.
 *
 *   Sibling tests cover the static UI contract (headerInfoButton, W900),
 *   the I-hotkey toggle path (W740), and popover contents
 *   (infoSeedShown, infoSessionCounter, actionLog, timeTrend), but no
 *   test pins the *absence* of aria-keyshortcuts. A regression that
 *   added `aria-keyshortcuts="i"` (well-meaning a11y "improvement")
 *   would slip past every existing test.
 *
 *   This is general PlayPage UX present in every phase (setup, playing,
 *   ended) so we don't need to start the game.
 *
 * Strategy mirrors PlayPage.headerInfoButton.test.tsx (W900):
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId` and locate the button via its testid.
 *   - Assert the button does NOT carry `aria-keyshortcuts`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-info-keyshortcuts-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Info Keyshortcuts Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-button keyshortcuts test.",
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

describe("PlayPage header info button aria-keyshortcuts contract (W969)", () => {
  it("does NOT advertise aria-keyshortcuts because the I-hotkey is window-level (W740)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("play-info-btn");

    // The "I" hotkey is bound on the *window*, not on this button. If
    // the button advertised `aria-keyshortcuts="i"`, screen-reader users
    // would be told the shortcut targets this button — but tabbing away
    // and pressing "i" would still toggle the popover, contradicting the
    // a11y promise. The correct contract is: no aria-keyshortcuts here.
    expect(btn.hasAttribute("aria-keyshortcuts")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
