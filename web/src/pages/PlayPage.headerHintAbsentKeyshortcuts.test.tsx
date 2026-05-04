/**
 * Unit test for the PlayPage header hint button aria-keyshortcuts
 * contract (W964) — pinning the *intentional absence* of the attribute.
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2010) renders a `<button data-testid="play-hint-btn">`
 *   in the header iconbar whenever (a) `phase === "playing"` and (b) the
 *   user has hints enabled (`cards-hints-enabled` localStorage flag, per
 *   W775) and the active plugin exposes a `hint()` function. A separate
 *   window-level keyboard handler maps the bare "H" key (and Shift+?) to
 *   `showHint()`, but the button itself deliberately carries NO
 *   `aria-keyshortcuts` attribute. The contract is intentional: the
 *   H-shortcut is page-global rather than button-scoped, and AT
 *   announcement of "press H to activate" while the button is focused
 *   would mislead users (H does not activate the *focused button*, it
 *   triggers showHint() regardless of focus). This is the direct analog
 *   of W945 (settings button / T key) and W955 (restart button / R key)
 *   — both window-level hotkeys that deliberately omit
 *   `aria-keyshortcuts` on their corresponding header buttons. Per the
 *   W941 finding, the hint button's H/Shift+? hotkeys are window-level
 *   only and never advertised on the button itself.
 *
 *   Pin the absence so a well-meaning a11y refactor that adds
 *   `aria-keyshortcuts="H"` (a plausible "improvement") doesn't slip in
 *   without a deliberate spec change. The pattern matches W939's
 *   absent-attribute strategy (`expect(...getAttribute(name)).toBeNull()`).
 *
 * Strategy mirrors W922 (PlayPage.headerHintButton.test.tsx) for the
 * fixture and W955 (PlayPage.headerRestartKeyshortcuts.test.tsx) for the
 * absent-attribute assertion:
 *   - Hoisted minimal fixture plugin with `hint()` defined so the
 *     iconbar branch (`phase === "playing" && hintsEnabled`) renders the
 *     button as enabled (`disabled={!plugin.hint || ...}` evaluates false).
 *   - Pre-seed `cards-hints-enabled = "true"` so the gate is open, and
 *     `cards-hint-cooldown = "false"` so the button isn't rendered in a
 *     countdown state.
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
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// `hint()` must be defined so the button is rendered as enabled (the
// `disabled={!plugin.hint || ...}` branch evaluates to false). Per the
// W775 finding, the button is also gated on `cards-hints-enabled` being
// "true" — we set that in beforeEach. Mirrors the W922 fixture.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-hint-absent-keyshortcuts-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Hint Absent Keyshortcuts Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the header hint-button absent-keyshortcuts test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
    isTerminal: () => null,
    // Returning a selector that won't match anything is fine — this test
    // never clicks the button, it only inspects its rendered attributes.
    hint: () => ({ selector: "[data-testid='nonexistent']" }),
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
  // Hints are gated by a Settings → Gameplay toggle (`cards-hints-enabled`).
  // Make the on-state explicit so this test isn't subject to default
  // changes elsewhere (per W775 finding).
  localStorage.setItem("cards-hints-enabled", "true");
  // Disable the cooldown gate so the button isn't rendered in a "5s"
  // countdown state — keeps the rendered DOM stable.
  localStorage.setItem("cards-hint-cooldown", "false");
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage header hint button absent aria-keyshortcuts contract (W964)", () => {
  it("does not advertise aria-keyshortcuts on the hint button (the H hotkey is window-level only, analog of W945/W955)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Hint button only mounts in the playing phase, so advance past the
    // setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-hint-btn") as HTMLButtonElement;

    // Pin the deliberate ABSENCE of aria-keyshortcuts. The H-key handler
    // lives on the window and triggers showHint() regardless of which
    // element holds focus, so announcing "Activate by pressing H" via
    // aria-keyshortcuts would mislead users when this button has focus
    // (H triggers showHint, it does not activate the focused button). A
    // future a11y refactor that adds `aria-keyshortcuts="H"` here should
    // be a deliberate spec change, not a silent drift — flip this test
    // red if the contract changes. Per W941: H is not a button-scoped
    // hotkey.
    expect(btn.getAttribute("aria-keyshortcuts")).toBeNull();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
