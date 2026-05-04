/**
 * Unit test for PlayPage seed-pick-btn aria-keyshortcuts absence (W979).
 *
 * Observable behavior:
 *   The toolbar's `play-seed-pick-btn` is a click-only control with no
 *   keyboard shortcut binding (the picker has no global hotkey — users
 *   open it via mouse/focus+Enter, not a chord). Per ARIA semantics,
 *   `aria-keyshortcuts` MUST only be present when there is an associated
 *   keyboard shortcut; otherwise screen readers will announce a phantom
 *   shortcut that does nothing.
 *
 *   Sibling buttons in the toolbar (undo / redo at PlayPage.tsx ~1973,
 *   1997) DO declare `aria-keyshortcuts` because they have real Ctrl/Cmd
 *   chord bindings, but the seed-pick button does not, and that
 *   distinction must not regress.
 *
 * Strategy:
 *   - Reuse the seed-picker / hotkey-N test scaffolding: a single
 *     "klondike" fixture so the toolbar (which is gated on
 *     klondike/freecell/spider) renders.
 *   - Pre-seed `cards-tutorial-seen` so the auto-launched tutorial
 *     coachmark is dismissed and `phase === "playing"` lands on a bare
 *     toolbar without coachmark/overlay interference.
 *   - Mount with `?seed=42` so the page starts in a deterministic state.
 *   - Locate `play-seed-pick-btn` and assert
 *     `getAttribute("aria-keyshortcuts") === null`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture so vi.mock factories below can reference it. vi.hoisted
// runs before the imports the factories close over.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (test)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Seed-pick aria-keyshortcuts test fixture.",
    settings: {} as Record<string, never>,
    initialState: (seed: number) => ({ seed }),
    reducer: (state: { seed: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship — null-stub keeps any
// stray render path side-effect-free.
vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

beforeEach(() => {
  localStorage.clear();
  // klondike has tutorial steps; the auto-launched tutorial would overlay
  // the toolbar. Mark the tutorial seen so the toolbar renders cleanly.
  localStorage.setItem(
    "cards-tutorial-seen",
    JSON.stringify({ [hoisted.TEST_GAME_ID]: true }),
  );
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage seed-pick-btn aria-keyshortcuts (W979)", () => {
  it("does not declare aria-keyshortcuts (no global hotkey opens the picker)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so the toolbar with the seed-pick
    // button is in the tree.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-seed-pick-btn");
    expect(btn.getAttribute("aria-keyshortcuts")).toBeNull();
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
