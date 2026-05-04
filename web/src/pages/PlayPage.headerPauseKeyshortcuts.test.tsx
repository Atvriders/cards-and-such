/**
 * Unit test for the PlayPage header pause button aria-keyshortcuts
 * contract (W963) — pinning the *intentional absence* of the attribute.
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1809) renders a `<button data-testid="play-pause-btn">`
 *   in the header iconbar whenever `phase === "playing"`. A separate
 *   window-level keyboard handler maps the bare "Esc" key to `togglePause()`,
 *   but the button itself deliberately carries NO `aria-keyshortcuts`
 *   attribute. The contract is intentional: the Esc-shortcut is page-global
 *   rather than button-scoped, and AT announcement of "press Esc to activate"
 *   while the button is focused would mislead users (Esc does not activate
 *   the *focused button*, it toggles pause regardless of focus). This is the
 *   direct analog of W945 (settings / T key) and W955 (restart / R key) —
 *   both window-level hotkeys that deliberately omit `aria-keyshortcuts` on
 *   their corresponding header buttons.
 *
 *   Pin the absence so a well-meaning a11y refactor that adds
 *   `aria-keyshortcuts="Escape"` (a plausible "improvement") doesn't slip in
 *   without a deliberate spec change.
 *
 * Strategy mirrors W955 (PlayPage.headerRestartKeyshortcuts.test.tsx):
 *   - Hoisted minimal counter fixture so the test pulls in zero real-game
 *     code paths. Pause button mounts unconditionally in the playing phase,
 *     so the fixture's settings schema can be empty.
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
// the playing phase. The pause button renders whenever phase === "playing"
// (no schema/state preconditions), so this fixture is intentionally bare.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-pause-keyshortcuts-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Pause Keyshortcuts Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only counter plugin for the header pause-button absent-keyshortcuts test.",
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

describe("PlayPage header pause button absent aria-keyshortcuts contract (W963)", () => {
  it("does not advertise aria-keyshortcuts on the pause button (the Esc hotkey is window-level only, analog of W945/W955)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pause button only mounts in the playing phase, so advance past the
    // setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-pause-btn") as HTMLButtonElement;

    // Pin the deliberate ABSENCE of aria-keyshortcuts. The Esc-key handler
    // lives on the window and toggles pause regardless of which element
    // holds focus, so announcing "Activate by pressing Esc" via
    // aria-keyshortcuts would mislead users when this button has focus
    // (Esc toggles pause, it does not activate the focused button per se;
    // and announcing it as a button shortcut overstates the binding's
    // scope). A future a11y refactor that adds `aria-keyshortcuts="Escape"`
    // here should be a deliberate spec change, not a silent drift — flip
    // this test red if the contract changes.
    expect(btn.getAttribute("aria-keyshortcuts")).toBeNull();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
