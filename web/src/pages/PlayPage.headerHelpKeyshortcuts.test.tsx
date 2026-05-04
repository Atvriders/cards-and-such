/**
 * Unit test for the PlayPage header help button keyboard-shortcut contract
 * (W971).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2125) renders a `<button data-testid="help-btn">`
 *   that opens the HowToPlay modal (or tutorial overlay) on click. The
 *   button has *no* global keyboard shortcut wired up — there is no
 *   `aria-keyshortcuts` attribute on the element, and `PlayPage` does
 *   not register a window-level key handler for it. This is intentional:
 *   help is a low-frequency, click-driven action, and adding a shortcut
 *   without also wiring the keydown listener would lie to assistive
 *   tech (announcing a shortcut that does nothing).
 *
 *   Sibling tests (W914 PlayPage.headerHelpButton.test.tsx) pin the
 *   button's tagName, type, aria-label, and SVG glyph, but no test
 *   pins the *absence* of `aria-keyshortcuts`. A regression that copy-
 *   pasted `aria-keyshortcuts="?"` from another button (e.g. the info
 *   button if it ever grew one) without registering a matching keydown
 *   handler would silently break the screen-reader contract — assistive
 *   tech would announce "press question mark for help" but pressing it
 *   would do nothing.
 *
 * Strategy mirrors PlayPage.headerHelpButton.test.tsx (W914):
 *   - Hoisted minimal fixture plugin with `howToPlay` text so the
 *     iconbar branch resolves true and the button mounts.
 *   - Mount at `/play/:gameId`, click start-game to enter playing phase.
 *   - Assert `btn.hasAttribute("aria-keyshortcuts") === false`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-help-keyshortcuts-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Help Keyshortcuts Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the help-button keyshortcuts test.",
    howToPlay: "Click cards to play. Match suits to win.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
    isTerminal: () => null,
    component: ({ state }: { state: State }) => (
      <div>
        <span data-testid="fx-count">{state.count}</span>
      </div>
    ),
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

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

describe("PlayPage header help button keyshortcuts contract (W971)", () => {
  it("does NOT carry an aria-keyshortcuts attribute (no fake shortcut announcement)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("help-btn");

    // Pin the *absence* of aria-keyshortcuts. PlayPage does not register
    // a global key handler for the help button, so adding this attribute
    // without the matching listener would lie to assistive tech.
    expect(btn.hasAttribute("aria-keyshortcuts")).toBe(false);
  });
});

void React;
