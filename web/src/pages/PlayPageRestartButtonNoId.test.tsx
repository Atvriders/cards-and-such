/**
 * Unit test for the PlayPage header restart button — intentional absence
 * of an `id` attribute (W2048).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2041) renders a `<button data-testid="play-restart-btn">`
 *   in the header iconbar whenever `phase === "playing"`. The button is
 *   identified for tests via its `data-testid` and for assistive tech via
 *   its `aria-label="Restart"`. It deliberately carries NO `id` attribute:
 *   the button is rendered in a list-like iconbar that may appear more
 *   than once across modes/views, and a hard-coded `id` would (a) violate
 *   the HTML uniqueness constraint if the button is ever duplicated, and
 *   (b) tempt CSS/JS to couple to a DOM-global selector instead of the
 *   stable `data-testid` / `play-iconbtn` class hooks.
 *
 *   Sibling tests pin the button's tagName, type, className, aria-label,
 *   title, data-tooltip, the inner SVG's aria-hidden/focusable, and the
 *   intentional absence of aria-keyshortcuts — but no test pins the
 *   intentional absence of `id`. A regression that added (e.g.)
 *   `id="restart"` would silently change the public DOM contract and
 *   risk duplicate-id violations in pages where multiple restart-style
 *   buttons render.
 *
 * Strategy mirrors W1283 (PlayPageRestartSvgAriaHidden.test.tsx):
 *   - Hoisted minimal counter fixture so the test pulls in zero real-game
 *     code paths.
 *   - Mount at `/play/:gameId`, click start-game to enter playing phase.
 *   - Locate the button via its testid.
 *   - Assert btn.hasAttribute("id") === false. ONE focused assertion.
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
  const TEST_GAME_ID = "restart-btn-no-id-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Restart Btn No-Id Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the restart-btn no-id test.",
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

describe("PlayPage header restart button no-id contract (W2048)", () => {
  it("renders the restart button without an `id` attribute", async () => {
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

    // No-id contract — the button is identified via data-testid /
    // aria-label / class hooks. A hard-coded `id` would risk duplicate-id
    // violations if the iconbar is rendered more than once on a page.
    expect(btn.hasAttribute("id")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
