/**
 * Unit test for the PlayPage header restart button — intentional absence
 * of an inline `style` attribute (W2151).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2041) renders a `<button data-testid="play-restart-btn">`
 *   in the header iconbar whenever `phase === "playing"`. The button is
 *   styled exclusively via the `play-iconbtn` CSS class — it deliberately
 *   carries NO inline `style` attribute. Inline styles would (a) override
 *   the cascade and break theming/dark-mode tokens defined on
 *   `.play-iconbtn`, and (b) couple visual presentation to the JSX,
 *   making it harder for designers to retheme via CSS alone.
 *
 *   Sibling tests pin the button's tagName, type, className, aria-label,
 *   title, data-tooltip, the inner SVG's aria-hidden/focusable, and the
 *   intentional absence of `id` / `aria-keyshortcuts` — but no test pins
 *   the intentional absence of an inline `style` attribute. A regression
 *   that added (e.g.) `style={{ color: "red" }}` would silently bypass
 *   the design-system tokens and break dark-mode contrast.
 *
 * Strategy mirrors W2048 (PlayPageRestartButtonNoId.test.tsx):
 *   - Hoisted minimal counter fixture so the test pulls in zero real-game
 *     code paths.
 *   - Mount at `/play/:gameId`, click start-game to enter playing phase.
 *   - Locate the button via its testid.
 *   - Assert btn.hasAttribute("style") === false. ONE focused assertion.
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
  const TEST_GAME_ID = "restart-btn-no-style-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Restart Btn No-Style Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the restart-btn no-style test.",
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

describe("PlayPage header restart button no-style contract (W2151)", () => {
  it("renders the restart button without an inline `style` attribute", async () => {
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

    // No-style contract — the button is styled exclusively via the
    // `play-iconbtn` class. An inline `style` would override theming
    // tokens and break dark-mode contrast.
    expect(btn.hasAttribute("style")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
