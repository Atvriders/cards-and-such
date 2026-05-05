/**
 * Unit test for the PlayPage header restart button — intentional absence
 * of a `tabindex` attribute (W2290).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2041) renders a `<button data-testid="play-restart-btn">`
 *   in the header iconbar whenever `phase === "playing"`. As a native
 *   `<button>`, the element is keyboard-focusable by default and therefore
 *   carries NO explicit `tabindex` attribute. Adding `tabindex="0"` would
 *   be redundant noise on a focusable element, while `tabindex="-1"` would
 *   silently remove the Restart action from the keyboard tab order — a
 *   serious accessibility regression for keyboard-only and AT users.
 *
 *   Sibling tests pin the button's tagName, type, className, aria-label,
 *   title, data-tooltip, the inner SVG's aria-hidden/focusable, and the
 *   intentional absence of `id` and inline style — but no test pins the
 *   intentional absence of `tabindex`. A regression that injected
 *   `tabIndex={-1}` (e.g. via a misguided "skip in tab order" tweak) would
 *   silently break keyboard accessibility without flagging any other
 *   contract.
 *
 * Strategy mirrors W2048 (PlayPageRestartButtonNoId.test.tsx):
 *   - Hoisted minimal counter fixture so the test pulls in zero real-game
 *     code paths.
 *   - Mount at `/play/:gameId`, click start-game to enter playing phase.
 *   - Locate the button via its testid.
 *   - Assert btn.hasAttribute("tabindex") === false. ONE focused assertion.
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
  const TEST_GAME_ID = "restart-btn-no-tabindex-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Restart Btn No-Tabindex Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the restart-btn no-tabindex test.",
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

describe("PlayPage header restart button no-tabindex contract (W2290)", () => {
  it("renders the restart button without an explicit `tabindex` attribute", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Restart button only mounts in the playing phase; advance past setup.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-restart-btn");

    // No-tabindex contract — native <button> is focusable by default;
    // an explicit tabindex would be either redundant (0) or break keyboard
    // accessibility (-1) for the Restart action.
    expect(btn.hasAttribute("tabindex")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
