/**
 * Unit test for the PlayPage header settings button aria-keyshortcuts
 * contract (W945) — pinning the *intentional absence* of the attribute.
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2145) renders a `<button data-testid="play-settings-btn">`
 *   in the header iconbar whenever `phase === "playing"` and the active
 *   plugin advertises a non-empty settings schema. A separate window-level
 *   keyboard handler (W756) maps the bare "T" key to `toggle settings
 *   modal`, but the button itself deliberately carries NO
 *   `aria-keyshortcuts` attribute. The contract is intentional: the
 *   T-shortcut is page-global rather than button-scoped, and AT
 *   announcement of "press T to activate" while the button is focused
 *   would mislead users (T does not activate the *focused button*, it
 *   toggles the settings modal regardless of focus). This mirrors the
 *   sibling W941 finding that the hint button's H/Shift+? hotkeys are
 *   also window-level only.
 *
 *   Pin the absence so a well-meaning a11y refactor that adds
 *   `aria-keyshortcuts="T"` (a plausible "improvement") doesn't slip in
 *   without a deliberate spec change. The pattern matches W939's
 *   absent-attribute strategy (`expect(...getAttribute(name)).toBeNull()`).
 *
 * Strategy mirrors PlayPage.headerSettingsButton.test.tsx (W906) for the
 * fixture and W939 (toolbarPrimaryRole) for the absent-attribute assertion:
 *   - Hoisted minimal fixture plugin with a non-empty settings schema so
 *     the iconbar branch (`Object.keys(plugin.settings).length > 0`)
 *     renders the button.
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
// The settings schema must be non-empty so the iconbar branch
// (`Object.keys(plugin.settings).length > 0`) renders the button.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-settings-keyshortcuts-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Settings Keyshortcuts Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the header settings-button absent-keyshortcuts test.",
    settings: settingsSchema,
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

describe("PlayPage header settings button absent aria-keyshortcuts contract (W945)", () => {
  it("does not advertise aria-keyshortcuts on the settings button (the T hotkey is window-level only, per W756)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Settings button only mounts in the playing phase, so advance past
    // the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-settings-btn") as HTMLButtonElement;

    // Pin the deliberate ABSENCE of aria-keyshortcuts. The T-key handler
    // lives on the window (W756) and toggles the settings modal
    // regardless of which element holds focus, so announcing
    // "Activate by pressing T" via aria-keyshortcuts would mislead users
    // when this button has focus (T toggles the modal, it does not
    // activate the focused button). A future a11y refactor that adds
    // `aria-keyshortcuts="T"` here should be a deliberate spec change,
    // not a silent drift — flip this test red if the contract changes.
    expect(btn.getAttribute("aria-keyshortcuts")).toBeNull();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
