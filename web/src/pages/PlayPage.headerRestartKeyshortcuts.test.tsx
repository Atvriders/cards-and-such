/**
 * Unit test for the PlayPage header restart button aria-keyshortcuts
 * contract (W955) — pinning the *intentional absence* of the attribute.
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2048) renders a `<button data-testid="play-restart-btn">`
 *   in the header iconbar whenever `phase === "playing"`. A separate
 *   window-level keyboard handler (PlayPage.tsx ~line 1571) maps the bare
 *   "R" key to `replay()` (with Shift+R reseeding), but the button itself
 *   deliberately carries NO `aria-keyshortcuts` attribute. The contract is
 *   intentional: the R-shortcut is page-global rather than button-scoped,
 *   and AT announcement of "press R to activate" while the button is
 *   focused would mislead users (R does not activate the *focused button*,
 *   it triggers replay regardless of focus, and it intentionally skips the
 *   "dice" category to avoid fighting the per-game Roll binding). This is
 *   the direct analog of W945 (settings button / T key) and W941 (hint
 *   button / H key) — both window-level hotkeys that deliberately omit
 *   `aria-keyshortcuts` on their corresponding header buttons.
 *
 *   Pin the absence so a well-meaning a11y refactor that adds
 *   `aria-keyshortcuts="R"` (a plausible "improvement") doesn't slip in
 *   without a deliberate spec change. The pattern matches W939's
 *   absent-attribute strategy (`expect(...getAttribute(name)).toBeNull()`).
 *
 * Strategy mirrors W945 (PlayPage.headerSettingsKeyshortcuts.test.tsx):
 *   - Hoisted minimal counter fixture so the test pulls in zero real-game
 *     code paths. Restart button mounts unconditionally in the playing
 *     phase, so the fixture's settings schema can be empty.
 *   - Mount at `/play/:gameId`, click start-game to enter playing phase.
 *   - Locate the button via its testid.
 *   - Assert getAttribute("aria-keyshortcuts") === null. ONE assertion,
 *     narrow scope.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted counter fixture — minimal plugin sufficient to drive PlayPage into
// the playing phase. The restart button renders whenever phase === "playing"
// (no schema/state preconditions), so this fixture is intentionally bare.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-restart-keyshortcuts-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Restart Keyshortcuts Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only counter plugin for the header restart-button absent-keyshortcuts test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, a: Action): State =>
      a.type === "inc" ? { count: s.count + 1 } : s,
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

describe("PlayPage header restart button absent aria-keyshortcuts contract (W955)", () => {
  it("does not advertise aria-keyshortcuts on the restart button (the R hotkey is window-level only, analog of W945)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Restart button only mounts in the playing phase, so advance past the
    // setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-restart-btn") as HTMLButtonElement;

    // Pin the deliberate ABSENCE of aria-keyshortcuts. The R-key handler
    // lives on the window (PlayPage.tsx ~line 1571) and triggers replay()
    // regardless of which element holds focus — and intentionally skips
    // the "dice" category to avoid fighting the per-game Roll binding —
    // so announcing "Activate by pressing R" via aria-keyshortcuts would
    // mislead users when this button has focus (R triggers replay, it
    // does not activate the focused button). A future a11y refactor that
    // adds `aria-keyshortcuts="R"` here should be a deliberate spec
    // change, not a silent drift — flip this test red if the contract
    // changes.
    expect(btn.getAttribute("aria-keyshortcuts")).toBeNull();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
